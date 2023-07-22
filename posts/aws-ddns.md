---
title: "AWS Dynamic DNS"
date: "March 20, 2022"
author: "Tyrel Hiebert"
excerpt: "A dynamic DNS is handy if you want to host something or access something on your home network but you don't have a static IP address from your ISP. I built a little dynamic DNS script for AWS Route53 using Node that runs on a Raspberry Pi."
hero: "/images/posts/aws-ddns.jpg"
tags: "aws ddns node raspberry-pi infrastructure"
---

This is a Dynamic DNS system built using AWS Route53 and a Node script running on a Raspberry Pi.

![](./aws-ddns.jpg)

## Index
* [What is a DDNS?](#what-is-a-ddns)
* [Prerequisites](#prerequisites)
* [Getting your current IP](#getting-your-current-ip)
* [Get the IP address from your DNS record to check if it needs to be updated](#get-the-ip-address-from-your-dns-record-to-check-if-it-needs-to-be-updated)
* [Update IP in DNS record](#update-ip-in-dns-record)
* [Run the script on a schedule](#run-the-script-on-a-schedule)
* [Resources](#resources)

## What is a DDNS?
A dynamic DNS is handy if you want to host or access things on your home network from the internet but you don't have a static IP address from your service provider.

Essentially what it does is update the IP address for a given DNS record to be the current public IP address of the machine running the script.

So for example, if you want to have a domain name always pointing to your home network, you run this script on a machine within your home network.

Let's say your domain is `example.com`, you could create an A record for `home.example.com` that points to your home network. You could manually check what your current public IP address is and set it in the AWS console. But likely you have a dynamic IP at home, and it may randomly change at any moment, breaking your DNS record.

Let's automate updating it

## Prerequisites
You'll need:
* An AWS account
	* With credentials set up in your environment of choice
* A domain and hosted zone set up in Route53
* Node installed
* AWS-SDK node package
* Some kind of machine running in your network of choice that will be always on so that it can run the script on a regular schedule. I use a Raspberry Pi as it's low power, easy to setup, and tiny.

First setup your project. I used NPM to init a new project, then added the `aws-sdk` and `node-fetch` packages. Also add `"type": "module"` to your _package.json_ so node doesn't yell at you for using `import`.

## Getting your current IP
There are many ways to do this. A trivial way that I chose is to use a service provided by AWS [checkip.amazonaws.com](http://checkip.amazonaws.com). Simply fetch that URL and trim the result to get your current public IP address.

It's probably a good idea to be validating the IP address returned is a valid IPV4 format. I make a simple helper function to validate an IP address

```javascript
import fetch from "node-fetch";

function validateIp(ipString) {
	const re = /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/;
	return !!ipString.match(re);
}

async function getCurrentIp() {
	console.log("Fetching current ip...");
	const response = await fetch("http://checkip.amazonaws.com/");
	const ip = (await response.text()).trim();
	if (validateIp(ip)) {
		console.log(ip);
		return ip;
	}
	console.error("Fetching ip failed");
	return false
}

async function main() {
	const ip = await getCurrentIp();
	if (!ip) {
		return 1;
	}
}

main();
```

## Get the IP address from your DNS record to check if it needs to be updated

This maybe isn't actually necessary. You're really just making a call to save yourself from making a call. But if this script got more complicated this might be a better idea.

Check out the [AWS Node SDK Docs](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-nodejs.html) and the [AWS JavaScript Route53 SDK Docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Route53.html) for more details on their usage.

I made a function  `getIpFromDnsRecord` that fetches the current IP address from the A record of the given hostname and hosted zone id.

```javascript
import fetch from "node-fetch";
import AWS from "aws-sdk";

const hostedZoneId = "GETTHISIDFROMYOURAWSCONSOLE";
const hostname = "home.yourdomain.com";

const route53 = new AWS.Route53({ apiVersion: "2013-04-01" });

function validateIp(ipString) {
	const re = /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/;
	return !!ipString.match(re);
}

async function getIpFromDnsRecord() {
	console.log(`Fetching ip currently set for ${hostname}...`);
	const params = {
		HostedZoneId: hostedZoneId,
		StartRecordName: hostname,
		StartRecordType: "A",
		MaxItems: "2"
	}
	const recordSets = await route53.listResourceRecordSets(params).promise()
	for (let record of recordSets["ResourceRecordSets"]) {
		if (record["Name"] == hostname + ".") {
			if (record["ResourceRecords"].length == 1) {
				const ip = record["ResourceRecords"][0]["Value"].trim();
				if (validateIp(ip)) {
					console.log(ip);
					return ip;
				}
			}
		}
	}
	console.error(`Fetching ip for hostname ${hostname} failed`)
	return false;
}

async function getCurrentIp() {
	console.log("Fetching current ip...");
	const response = await fetch("http://checkip.amazonaws.com/");
	const ip = (await response.text()).trim();
	if (validateIp(ip)) {
		console.log(ip);
		return ip;
	}
	console.error("Fetching ip failed");
	return false
}

async function main() {
	const ip = await getCurrentIp();
	if (!ip) {
		return 1;
	}

	const previousIp = await getIpFromDnsRecord();
	if (!previousIp) {
		return 1;
	}

	if (ip == previousIp) {
		console.log("Ip hasn't changed. No action required")
	} else {
		console.log("Ip address has changed!")
	}
	
	return 0;
}

main();
```

## Update IP in DNS record
If the current public IP address is different than the one set in your DNS record, you'll want to update it!

I made a function `setIpInDnsRecord(ip)` that will update the DNS record in Route53.

```javascript
import fetch from "node-fetch";
import AWS from "aws-sdk";

const hostedZoneId = "GETTHISIDFROMYOURAWSCONSOLE";
const hostname = "home.yourdomain.com";

const route53 = new AWS.Route53({ apiVersion: "2013-04-01" });

function validateIp(ipString) {
	const re = /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/;
	return !!ipString.match(re);
}

async function setIpInDnsRecord(ip) {
	console.log(`Updating DNS record for ${hostname} to ${ip}...`);
	const date = new Date();
	const params = {
		ChangeBatch: {
			Changes: [{
				Action: "UPSERT", // this will update an existing record
				ResourceRecordSet: {
					Name: hostname,
					ResourceRecords: [
						{ Value: ip }
					],
					TTL: 300,
					Type: "A"
				}
			}],
			Comment: `Updated IP address on ${date.toString()}`
		},
		HostedZoneId: hostedZoneId
	};
	const response = await route53.changeResourceRecordSets(params).promise();
	// missing any error handling
	console.log(`DNS record for ${hostname} updated to ${ip}. Can take up to 60s to propogate`);
}

async function getIpFromDnsRecord() {
	console.log(`Fetching ip currently set for ${hostname}...`);
	const params = {
		HostedZoneId: hostedZoneId,
		StartRecordName: hostname,
		StartRecordType: "A",
		MaxItems: "2"
	}
	const recordSets = await route53.listResourceRecordSets(params).promise()
	for (let record of recordSets["ResourceRecordSets"]) {
		if (record["Name"] == hostname + ".") {
			if (record["ResourceRecords"].length == 1) {
				const ip = record["ResourceRecords"][0]["Value"].trim();
				if (validateIp(ip)) {
					console.log(ip);
					return ip;
				}
			}
		}
	}
	console.error(`Fetching ip for hostname ${hostname} failed`)
	return false;
}

async function getCurrentIp() {
	console.log("Fetching current ip...");
	const response = await fetch("http://checkip.amazonaws.com/");
	const ip = (await response.text()).trim();
	if (validateIp(ip)) {
		console.log(ip);
		return ip;
	}
	console.error("Fetching ip failed");
	return false
}

async function main() {
	const ip = await getCurrentIp();
	if (!ip) {
		return 1;
	}

	const previousIp = await getIpFromDnsRecord();
	if (!previousIp) {
		return 1;
	}

	if (ip == previousIp) {
		console.log("Ip hasn't changed. No action required")
	} else {
		console.log("Ip address has changed!")
		await setIpInDnsRecord(ip);
	}
	
	return 0;
}

main();
```

And that's about it for the script! You could make this simpler or more complex as you see fit.

Try it out by running the script

```bash
node script.js
```

## Run the script on a schedule
I am running this on a Raspberry Pi running the Raspberry Pi OS. This should be similar to any Linux environment (I think? 🤷🏻‍♂️).

I used a cron to schedule the node script. Open your cron schedules with
```bash
crontab -e
```

Add a new schedule for your script. Google cron syntax if you're unfamiliar. I set mine to trigger ever 10 minutes.

```crontab
*/10 * * * * node /home/YOURUSERNAME/path/to/script.js
```

Save that file with the new entry at the bottom.

Now just restart your machine and the cron should take effect.

As long as the device remains powered on and running inside your network, your DNS record will remain updated with your current IP address!

## Resources
*  [AWS Node SDK Docs](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-nodejs.html)
*  [AWS JavaScript Route53 SDK Docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Route53.html)
* [AWS DDNS Example](https://github.com/awslabs/route53-dynamic-dns-with-lambda/blob/master/v1/dynamic_dns_lambda.py)
* [Crons on Raspberry Pi](https://bc-robotics.com/tutorials/setting-cron-job-raspberry-pi/)
* [DDNS Example from Anthony Heddings](https://gist.github.com/anthonyheddings/f22967967bbf524ed510c356678b2651)
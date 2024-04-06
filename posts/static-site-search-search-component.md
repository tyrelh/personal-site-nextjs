---
title: Static Site Search Part 2 - Search Component
date: April 10, 2024
author: Tyrel Delaney
tags: static-site-generators nextjs javascript typesense search
hero: /images/posts/static-site-search-preprocessing-articles.jpg
excerpt: This is the followup to Part 1 in this series on building a Static Site Search for my website. In the first part I built a search index of my articles for quick searching. In this part I'll import that search index into my Next project and create a UI to interact with it. The search component described here is live on this site!
id: 21
---

![](./static-site-search-preprocessing-articles.jpg)

## Static Site Search Series

In [my previous article on this topic](https://superflux.dev/blog/static-site-search-preprocessing-articles), I talked about preprocessing my articles and creating a search index. This search index allows for quick referencing the articles that match a particular search term.

In this article I'm going to talk about how I used this search index to perform searches.

## Desired Behaviour

I wanted a couple things from my search. I wanted it to display results in real-time as you searched, and I didn't want to implement any kind of search results page. I wanted it to just be intuitive and quick.

## Search Component

I use [Ant Design](https://ant.design) a bit on this site. It's just a library I'm familiar with.

They offer a component that they call [Select with Search](https://ant.design/components/select#select-demo-search). It's essentially a multi-select dropdown that lets you filter the options by typing into a text input.

By default, you provide it a list of options, and then the search will filter those options. You can customize the callbacks for both when an item is clicked or you press return, and the search callback that occurs whenever the input changes.

This was close enough to what I wanted and I'll describe how I customized it.

I started by making a wrapper around the Ant Design Select component so I can easily customize it and then stick it wherever I need to.

It started off something like this

*components/elements/SearchInput.tsx*
```tsx
import React from "react";
import { Select } from 'antd';

export default function SearchInput(props) {
	return (
		<Select
		    showSearch
		    placeholder="Select a person"
		    optionFilterProp="children"
		    options={[
			  {
				value: 'jack',
				label: 'Jack',
			  },
			  {
				value: 'lucy',
				label: 'Lucy',
			  }
		    ]}
		/>
	)
}
```

To more easily type the `options`, I created a little `OptionsValue` interface at the top of the file:

```tsx
interface OptionValue {
	label: string;
	value: string;
}
```

## Loading the Search Index

I'm doing this a very sketchy way, I think. I'm really not a frontend developer so I kinda just made this up as I went.

My plan is eventually to slim down the index enough that I can just build it in with the rest of my static site, but for now since it's 600+ KB I tried to lazy load it to not mess with the initial page load.

Essentially I'm just loading the file in a `useEffect` and setting it into the component state.

*components/elements/SearchInput.tsx*
```tsx
export default function SearchInput(props) {
	const [searchIndex, setSearchIndex] = useState<Map<string, object>>(new Map());

	useEffect(() => {
		if (!searchIndex) {
			import("./search-index.json")
				.then((data) => {
					const indexMap = new Map<string, object>();
					for (const key of Object.keys(data)) {
						indexMap.set(key, data[key]);
					}
					setSearchIndex(indexMap);
				})
				.catch((error) => {
					console.error("Error loading search index", error);
				})
		}
	}, []);

	return (
		<Select
		    showSearch
		    placeholder="Select a person"
		    optionFilterProp="children"
		    options={[
			  {
				value: 'jack',
				label: 'Jack',
			  },
			  {
				value: 'lucy',
				label: 'Lucy',
			  }
		    ]}
		/>
	)
}
```

## Options

So I could have just provided a list of the article titles to this component and called it a day. I wouldn't have had to bother with all the preprocessing and indexing. But that would only have let me search the titles, not the tags and the excerpts.

With my search index I get a lot more nuance. For example if you search "docker" you get 1 result which is my post titled "What I'm Learning in 2022", which just wouldn't work with a simple title search.

First I initialize an empty options array in component state

```tsx
const [options, setOptions] = useState<OptionValue[]>([]);
```

Then I pass this to the `Select` component

```tsx
<Select
	showSearch
	placeholder="Search"
	suffixIcon={<SearchOutlined />} // Custom Ant icon to show in the right of the input field
	options={options}
/>
```

Great! So now I have my search index available, and I can now implement my custom search functionality using the index.

## onSearch

The Select component from Ant Design has an overridable `onSearch` function. I'm going to override this function and use the current search term to populate the `options` using the values from the `searchIndex`.

A couple things I do in this code:

- I check to make sure I'm not repeating the same searches. Not sure how necessary this is or not, I don't remember. This uses a `useRef` on the component to track the search iterations and a `useState` to track the previous search term.
- I check for empty string search terms and simply set an empty list in the `options`, no need to check the search index.
- I was doing some stuff with lodash `debounce` and `useMemo` to delay the search, but I'm not sure if this is necessary. I'll show it afterwards as optional.

After those checks, I imply lowercase the search term and then pull the value from the `searchIndex`.

If the search term doesn't exist as a key in the `searchIndex` I simply set an empty array in `options`.

If the search term does exist, then I pull the values from the `searchIndex` for that key, I convert the `{ title: string, slug: string }` into a `{ value: string, label: string }` where `value` = `slug` and `label` = `title`. I build a new options array of all the values from that search term and then set that new array into `options` component state.

When that `options` component state gets set, the component then re-renders showing the new options.

Here's the code for this `onSearch` handler

```tsx
const [searchIndex, setSearchIndex] = useState<Map<string, object>>(new Map());
const [options, setOptions] = useState<OptionValue[]>([]);
const fetchRef = useRef(0);
const [previousSearchTerm, setPreviousSearchTerm] = useState<string>("");

const onChange = (searchTerm: string) => {
	fetchRef.current += 1
	const currentFetch = fetchRef.current;
	if (currentFetch !== fetchRef.current) {
		return;
	}
	if (searchTerm.length < 1) {
		setOptions([]);
		return;
	}
	searchTerm = searchTerm.toLowerCase();
	if (searchTerm === previousSearchTerm) {
		return;
	}
	setPreviousSearchTerm(searchTerm);

	if (searchIndex.entries() && searchIndex.has(searchTerm)) {
		const newOptions = new Array<OptionValue>();
		for (const item of searchIndex.get(searchTerm) as { title: string, slug: string}[]) {
			newOptions.push({
				value: item.slug,
				label: item.title
			})
		}
		setOptions(newOptions);
	}
}
```

Then on the `Select` component I pass a few more props.

- I set `filterOption={false}`. This essentially disables the built-in filtering using the search term and the labels. I don't need it to filter the results because I'm filtering the `options` myself.
- I pass a reference to my `onSearch` function in the `onSearch` prop.
- I pass a simple sort function in the `filterSort` prop to organize the options alphabetically.
- I pass `notFoundContent={null}` to get rid of the default empty state when no search results are found. This just hides the results pane when empty. Could maybe do some nicer customization here.

The component looks something like this:

```tsx
<Select
	showSearch
	filterOption={false}
	onSearch={onSearch}
	placeholder="Search"
	suffixIcon={<SearchOutlined />}
	filterSort={(a: OptionValue, b: OptionValue) => (a?.label ?? "").toLowerCase().localeCompare((b?.label ?? "").toLowerCase())}
	notFoundContent={null}
	options={options}
/>
```

![[Screenshot 2024-03-31 at 10.25.37 PM.png]]

## Navigate to the selected page

Lastly, we want to actually navigate to the corresponding page if a value in the search is clicked.

We can pass a `onSelect` prop that handles this. In this function I simply use the `value` from the selected option which is the `slug` of the post, and Next `useRouter` to navigate to that page.

The function is as simple as this:

```tsx
const router = useRouter();

const navigateToArticle = (value: string) => {
	router.push(`/blog/${value}`);
}
```

And thats it! I won't touch on styling or how I placed this component on my website. You can see that for yourself! Also the styling is going to be unique for your project if you're looking to replicate this.

The final code for my customized component looks like this

*components/elements/SearchInput.tsx*
```tsx
import React, { useEffect, useState, useRef } from "react";
import { Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation'

interface OptionValue {
	label: string;
	value: string;
}

export default function SearchInput() {
	const router = useRouter();
	
	const [searchIndex, setSearchIndex] = useState<Map<string, object>>(new Map());
	const [options, setOptions] = useState<OptionValue[]>([]);
	const fetchRef = useRef(0);
	const [previousSearchTerm, setPreviousSearchTerm] = useState<string>("");
	
	const onChange = (searchTerm: string) => {
		fetchRef.current += 1
		const currentFetch = fetchRef.current;
		if (currentFetch !== fetchRef.current) {
			return;
		}
		if (searchTerm.length < 1) {
			setOptions([]);
			return;
		}
		searchTerm = searchTerm.toLowerCase();
		if (searchTerm === previousSearchTerm) {
			return;
		}
		setPreviousSearchTerm(searchTerm);
	
		if (searchIndex.entries() && searchIndex.has(searchTerm)) {
			const newOptions = new Array<OptionValue>();
			for (const item of searchIndex.get(searchTerm) as { title: string, slug: string}[]) {
				newOptions.push({
					value: item.slug,
					label: item.title
				})
			}
			setOptions(newOptions);
		}
	}

	const navigateToArticle = (value: string) => {
		router.push(`/blog/${value}`);
	}

	useEffect(() => {
		if (!searchIndex) {
			import("./search-index.json")
				.then((data) => {
					const indexMap = new Map<string, object>();
					for (const key of Object.keys(data)) {
						indexMap.set(key, data[key]);
					}
					setSearchIndex(indexMap);
				})
				.catch((error) => {
					console.error("Error loading search index", error);
				})
		}
	}, []);

	return (
		<Select
			showSearch
			filterOption={false}
			onSearch={onSearch}
			onSelect={navigateToArticle}
			placeholder="Search"
			suffixIcon={<SearchOutlined />}
			filterSort={(a: OptionValue, b: OptionValue) => (a?.label ?? "").toLowerCase().localeCompare((b?.label ?? "").toLowerCase())}
			notFoundContent={null}
			options={options}
		/>
	)
}
```

## Add delay to the search

If your running into some issues with your search firing multiple times, or you'd just like to add a delay for aesthetics, you can use `useMemo` and lodash `debounce`. Simply wrap your `onChange` function in the following

```tsx
const onChange = useMemo(() => {
	const getItems = (searchTerm: string) => {
		// your logic for filtering the options
	}
	return debounce(getItems, 50); // delay in ms
}, [searchIndex])
```

## Resources

- [Ant Design Select component](https://ant.design/components/select)

## Repository

This website in it's entirety is viewable on [GitHub](https://github.com/tyrelh/personal-site-nextjs).

The search logic doesn't have it's own repo yet. But I'll update that here if I ever split it out.

## Conclusion

I think this turned out really well. It works great and really only took a couple of days to figure out end-to-end. It was a pretty interesting and fun project too.

I was going to call this "Next.js Static Site Search", but in the end with this solution it really has nothing to do with Next. You should be able to incorporate this into any statically generated site, particularly those using Markdown and React, although you should be able to adapt it to other stacks as well.

This is working quite well for me in it's current state, but there are lots of optimizations to be made. If I get around to those I'll post a third part to this series explaining the optimizations I implemented.

Thanks for reading!

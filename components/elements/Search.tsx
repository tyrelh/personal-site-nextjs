import React, { useEffect, useState, useRef } from "react";
import { Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation'
import { PostMetadata } from "../../dtos/PostData";
import { getPostMetadataById } from "../../utils/postMetadataUtils";
import { jsonToSearchIndex } from "../../utils/searchIndexUtils";

interface OptionValue {
    label: string;
    value: string;
}

export interface Props {
    searchIndexJson: string;
    postMetadataList: PostMetadata[];
}

export default function SearchInput(props: Props) {
    const router = useRouter();
    const [searchIndex, setSearchIndex] = useState<Map<string, number[]>>(new Map());
    const [options, setOptions] = useState<OptionValue[]>([]);
    const [previousSearchTerm, setPreviousSearchTerm] = useState<string>('');
    const fetchRef = useRef(0);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    const navigateToArticle = (value: string) => {
        router.push(`/blog/${value}`);
    }

    const onChange = (searchTerm: string) => {
        fetchRef.current += 1;
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
        if (searchIndex.size && searchIndex.has(searchTerm)) {
            const newOptions = new Array<OptionValue>();
            console.log(`matching search term "${searchTerm}" to post ids [ ${searchIndex.get(searchTerm)} ]`)
            for (const id of searchIndex.get(searchTerm)) {
                const item: PostMetadata = getPostMetadataById(id, props.postMetadataList);
                newOptions.push({
                    value: item.slug,
                    label: item.title,
                });
            }
            setOptions(newOptions);
        } else {
            console.log(`no match for search term "${searchTerm}"`)
            setOptions([]);
        }
    }

    useEffect(() => {
        // deserialize search index
        if (!searchIndex.size) {
            setSearchIndex(jsonToSearchIndex(props.searchIndexJson));
            console.log("Set search index");
        }

        // hack to get focus drop shadow working
        document.querySelector('.ant-select-selection-search input').addEventListener('focus', function() {
            this.parentNode.parentNode.style.boxShadow = "0 3px 5px #00000022";
        });
        document.querySelector('.ant-select-selection-search input').addEventListener('blur', function() {
            // this.parentNode.parentNode.style.boxShadow = "0 2px 3px #00000011";
            this.parentNode.parentNode.style.boxShadow = "";
        });

        // breakpoint handler to adjust search affix position
        const handleResize = () => {
            setIsMobile(window.matchMedia('(max-width: 768px)').matches);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
    
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobile]);

    return (
        <div
            className="search-affix"
            style={{
                right: isMobile ? 20 : 70,
                top: isMobile ? null : 2,
                bottom: isMobile ? 10 : null
            }}
        >
            <Select
                popupClassName="search-items"
                style={{ width: 300}}
                showSearch
                filterOption={false}
                onSearch={onChange}
                onSelect={navigateToArticle}
                placeholder="Search"
                suffixIcon={<SearchOutlined />}
                filterSort={(a: OptionValue, b: OptionValue) =>
                    (a?.label ?? '').toLowerCase().localeCompare((b?.label ?? '').toLowerCase())
                }
                options={options}
                notFoundContent={null}
            />
        </div>
    );
}

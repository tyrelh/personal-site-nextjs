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
    const [searchIndexLoaded, setSearchIndexLoaded] = useState<boolean>(false);
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
        if (searchIndex.entries() && searchIndex.has(searchTerm)) {
            const newOptions = new Array<OptionValue>();
            for (const item of searchIndex.get(searchTerm) as { title: string, slug: string }[]) {
                newOptions.push({
                    value: item.slug,
                    label: item.title,
                });
            }
            setOptions(newOptions);
        } else {
            setOptions([]);
        }
    }

    useEffect(() => {
        // hack to get focus drop shadow working
        document.querySelector('.ant-select-selection-search input').addEventListener('focus', function() {
            this.parentNode.parentNode.style.boxShadow = "0 3px 5px #00000022";
        });
        document.querySelector('.ant-select-selection-search input').addEventListener('blur', function() {
            // this.parentNode.parentNode.style.boxShadow = "0 2px 3px #00000011";
            this.parentNode.parentNode.style.boxShadow = "";
        });

        const handleResize = () => {
            setIsMobile(window.matchMedia('(max-width: 768px)').matches);
        };
    
        handleResize();
        window.addEventListener('resize', handleResize);
    
        // load search index
        if (!searchIndexLoaded) {
            import("./search-index.json")
                .then((data) => {
                    const indexMap = new Map<string, object>();
                    for (const key of Object.keys(data)) {
                        indexMap.set(key, data[key]);
                    }
                    setSearchIndex(indexMap);
                    setSearchIndexLoaded(true);
                })
                .catch((error) => {
                    console.error('Error loading search index:', error);
                });
            // return () => {
            // }
        }
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
                placeholder={searchIndexLoaded ? "Search" : '...'}
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

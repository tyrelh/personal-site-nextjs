import React, { PropsWithChildren, useEffect, useState, useMemo, useRef } from "react";
import { Input, Select, SelectProps, Spin, Affix } from 'antd';
import type { SearchProps } from 'antd/es/input/Search';
import { SearchOutlined } from '@ant-design/icons';
import debounce from 'lodash/debounce';
import { useRouter } from 'next/navigation'


const { Search } = Input;

export interface Props extends PropsWithChildren<any> {

}

interface OptionValue {
    label: string;
    value: string;
  }


export default function SearchInput(props: Props) {
    const router = useRouter()
    const [searchIndex, setSearchIndex] = useState<Map<string, object>>(new Map());
    const [searchIndexLoaded, setSearchIndexLoaded] = useState<boolean>(false);
    const [options, setOptions] = useState<{ value: string, label: string }[]>([]);
    const [previousSearchTerm, setPreviousSearchTerm] = useState<string>('');
    const [fetching, setFetching] = useState<boolean>(false);
    const fetchRef = useRef(0);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    

    const navigateToArticle = (slug: string) => {
        router.push(`/blog/${slug}`)
    }

    const onChange = useMemo(() => {
        const getItems = (searchTerm: string) => {
            fetchRef.current += 1;
            const currentFetch = fetchRef.current;
            setFetching(true);
            console.log('getItems', searchTerm);
            if (currentFetch !== fetchRef.current) {
                console.log('fetch cancelled');
                return;
            }
            if (searchTerm.length < 1) {
                console.log('no search term');
                setOptions([]);
                setFetching(false);
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
                console.log('newOptions', newOptions.length);
                setOptions(newOptions);
            } else {
                console.log('no results')
                setOptions([]);
            }
            setFetching(false);
        }
        if (!fetching) {
            return debounce(getItems, 50);
        } else {
            console.log('fetching');
        }
    }, [searchIndex])

    const onSelect = (value: string, option: object) => {
        console.log('onSelect', value, option);
        navigateToArticle(value);
    
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
            console.log('resize', isMobile);
            // console.log('resize', window.matchMedia('(max-width: 768px)').matches);
            setIsMobile(window.matchMedia('(max-width: 768px)').matches);
        };
    
        // Initial check
        handleResize();
    
        // Listen for window resize events
        window.addEventListener('resize', handleResize);
    
        // Cleanup
        


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
                // style={{ width: isMobile ? 200 : 300}}
                style={{ width: 300}}
                showSearch
                filterOption={false}
                onSearch={onChange}
                onSelect={onSelect}
                placeholder={searchIndexLoaded ? "Search" : '...'}
                optionFilterProp="children"
                suffixIcon={<SearchOutlined />}
                filterSort={(optionA: OptionValue, optionB: OptionValue) =>
                    (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                }
                options={options}
                notFoundContent={fetching ? <Spin size="small" /> : null}
            />
        </div>
    );
}

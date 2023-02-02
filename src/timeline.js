/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
    Row as AntRow,
    Col as AntCol,
    Button,
    Timeline,
    Dropdown,
    Menu,
    Select,
    Popover,
    Input,
    DatePicker,
    Space,
} from 'antd';
import {
    AuditOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    SearchOutlined,
    CustomerServiceOutlined,
    DollarCircleOutlined,
    ContactsOutlined,
    TagOutlined,
    MessageOutlined,
    DownOutlined,
    ArrowsAltOutlined,
    ShrinkOutlined,
} from '@ant-design/icons';
import moment from 'moment-timezone';
import FineTune from '../../../../src/utils/fineTune';
const timezone = 'America/New_York'; // This should ideally come from config
const dataTZ = 'America/Chicago'; // This should ideally come from config

const ICON_REGEX = [
    {
        icon: CustomerServiceOutlined,
        regex: /phone interaction/,
        buttonLabel: 'memo',
    },
    {
        icon: DollarCircleOutlined,
        regex: /payment/,
        buttonLabel: 'details',
    },
    {
        icon: MessageOutlined,
        regex: /chat/,
        buttonLabel: 'memo',
    },
    {
        icon: ContactsOutlined,
        regex: /customer|update/,
        buttonLabel: 'details',
    },
    {
        icon: TagOutlined,
        regex: /promo/,
        buttonLabel: 'details',
    },
];

const handleIcon = (type, description) => {
    const stringToTest = `${type} ${description}`.toLowerCase();
    for (let i = 0; i < ICON_REGEX.length; i += 1) {
        const current = ICON_REGEX[i];
        const containsKeyword = current.regex.test(stringToTest);
        if (containsKeyword) return [current.icon, current.buttonLabel];
    }
    return [AuditOutlined, 'memo'];
};

const TimelineItem = ({
    memoItem: {
        type = '',
        description = '',
        formattedDate,
        performedBy,
        manualText = '',
        ptn,
        applicationId,
    },
    composers: [Row, Col],
    showDescriptionByDefault,
}) => {
    const [DotIcon, typeSuffix] = handleIcon(type, description);
    const customerHeaderContainer = document.getElementById('customer-header');
    const [descriptionVisible, setDescriptionVisible] = useState(
        customerHeaderContainer?.style?.width === '0px'
            ? true
            : showDescriptionByDefault
    );
    const buttonLabel = `VIEW ${typeSuffix}`.toUpperCase();
    const { date } = formattedDate;
    const memoTitle = `${type[0].toUpperCase()}${type.slice(1)}`;
    return (
        <Timeline.Item dot={<DotIcon className="timeline__dot--icon" />}>
            <Row ft="eventType">{memoTitle}</Row>
            <Row ft="memoWrapper">
                <Col ft="memoWrapper.rows.eventDate">{date}</Col>
                {performedBy && (
                    <Col ft="memoWrapper.rows.eventDate">
                        Performed By: {performedBy}
                    </Col>
                )}
                {applicationId && (
                    <Col ft="memoWrapper.rows.eventDate">
                        Application Id: {applicationId}
                    </Col>
                )}
                {ptn && <Col ft="memoWrapper.rows.eventDate">CTN: {ptn}</Col>}

                {manualText && (
                    <Col ft="memoWrapper.rows.eventDate">
                        Manual Text: {manualText}
                    </Col>
                )}
                {description && description === 'Cancellation - Port Out' && (
                    <Col
                        ft="memoWrapper.rows.portOut"
                        style={{ color: '#f00 !important' }}
                    >
                        {description}
                    </Col>
                )}
                <Col ft="memoWrapper.rows.buttonWrapper">
                    {description ? (
                        <Row ft="memoWrapper.rows.viewButton">
                            <div onClick={() => setDescriptionVisible(true)}>
                                {descriptionVisible ? description : buttonLabel}
                            </div>
                        </Row>
                    ) : null}
                </Col>
            </Row>
        </Timeline.Item>
    );
};

const getDate = (val, date) => {
    if (val) {
        const time =
            val + -1 * new moment(date).tz(dataTZ).utcOffset() * 60 * 1000;
        return moment(time).tz(timezone);
    }
    return moment();
};

const getDataWithTimestamp = (data) =>
    data?.map((item) => {
        const itemDate = getDate(
            item.timestamp ? parseInt(item.timestamp) : '',
            item.date || '01-01-1970'
        );
        return {
            ...item,
            formattedDate: {
                moment: itemDate,
                date: itemDate.format('MMM D, YYYY hh:mm:ss a'),
            },
        };
    });

const compareByDateRange = (currentDate, [beginDate, endDate]) => {
    const newEndDate = moment(endDate).startOf('day').add(1, 'days');
    const newBeginDate = moment(beginDate).startOf('day');
    const newcurrentDate = moment(currentDate).startOf('day');

    if (beginDate && endDate) {
        return newcurrentDate.isBetween(newBeginDate, newEndDate);
    }
    if (beginDate) {
        return newcurrentDate.isAfter(newBeginDate);
    }
    if (endDate) {
        return newcurrentDate.isBefore(newEndDate);
    }
    return true;
};

const sortData = (d, sortOrder, dateRanges) =>
    d
        ?.sort((a, b) =>
            sortOrder === 'asc'
                ? b.timestamp - a.timestamp
                : a.timestamp - b.timestamp
        )
        ?.filter((item) =>
            compareByDateRange(item?.formattedDate?.moment, dateRanges)
        );

const groupByDate = (data, descending = true) => {
    const groupByYearMonth = data?.reduce((acc, item) => {
        const ym = item.formattedDate.moment.format('YYYYMM');
        acc[ym] = acc[ym] ? [...acc[ym], item] : [item];
        return acc;
    }, {});

    return Object.keys(groupByYearMonth)
        ?.sort((a, b) => (descending ? b - a : a - b))
        ?.map((k) => groupByYearMonth[k])
        ?.filter((d) => d.length);
};

const filterData = (unfilteredData, filterTypes, filterIds) => {
    let finalFilteredData = unfilteredData;
    if (filterTypes.length > 0) {
        const filteredData = unfilteredData.map((dataItem) => {
            const filteredDataItem = dataItem?.filter((item) =>
                filterTypes.includes(item?.type)
            );
            if (filteredDataItem.length > 0) {
                return filteredDataItem;
            }
            return null;
        });
        finalFilteredData = filteredData.filter((item) => item);
    }
    if (filterIds.length > 0) {
        let filteredDataWithIds = [];
        finalFilteredData.map((dataItem) => {
            const filteredDataItem = dataItem?.filter((item) =>
                filterIds.includes(item?.performedBy)
            );
            filteredDataItem.length > 0 &&
                filteredDataWithIds.push(filteredDataItem);
        });
        finalFilteredData = filteredDataWithIds.filter((item) => item);
    }
    return finalFilteredData;
};

const filterDataWithText = (unfilteredData, searchText = '') => {
    let finalFilteredData = unfilteredData;
    let filteredData;

    if (searchText === '') {
        filteredData = unfilteredData.map((dataItem) =>
            dataItem.length > 0 ? dataItem : null
        );
    } else {
        filteredData = unfilteredData.map((dataItem) => {
            const filteredDataItem = dataItem?.filter((item) =>
                item?.description
                    ?.toLowerCase()
                    ?.includes(searchText?.toLowerCase())
            );
            if (filteredDataItem.length > 0) {
                return filteredDataItem;
            }
            return null;
        });
    }

    finalFilteredData = filteredData.filter((item) => item);
    return finalFilteredData;
};

const handleSortChange = (data, sortDataFilter, selectedDateRange) => {
    switch (sortDataFilter) {
        case 'dateDescending':
            return [sortData(data, 'asc', selectedDateRange), true];
        case 'dateAscending':
            return [sortData(data, 'desc', selectedDateRange), false];
        default:
            return [sortData(data, 'desc', selectedDateRange), false];
    }
};

const mapTimelines = (groupedData = [], Row, Col) => {
    return groupedData?.map((data, index) => {
        const dateInfo = data[0].formattedDate;
        const groupTitle = `${dateInfo.moment.format(
            'MMM YYYY'
        )}`.toUpperCase();

        const showDescriptionByDefault = index === 0;
        return (
            <Row key={index} ft="timelineGroupWrapper">
                <Col ft="timelineGroupWrapper.rows.groupTitle">
                    {groupTitle}
                </Col>
                <Col ft="timelineGroupWrapper.rows.elementWrapper">
                    <Timeline mode="left">
                        {data.map((memoItem, dataIndex) => (
                            <TimelineItem
                                key={dataIndex}
                                memoItem={memoItem}
                                composers={[Row, Col]}
                                showDescriptionByDefault={
                                    showDescriptionByDefault
                                }
                            />
                        ))}
                    </Timeline>
                </Col>
            </Row>
        );
    });
};

const SortDropdown = ({ dropdownOnClick }) => (
    <Dropdown
        menu={
            <Menu onClick={dropdownOnClick}>
                <Menu.Item key="dateAscending">Date (Ascending)</Menu.Item>
                <Menu.Item key="dateDescending">Date (Descending)</Menu.Item>
            </Menu>
        }
    >
        <div
            style={{
                color: '#595959',
                fontSize: 12,
                cursor: 'pointer',
            }}
        >
            SORT BY <DownOutlined />
        </div>
    </Dropdown>
);

const DateRange = ({ cx, selectedDateRange, setSelectedDateRange }) => {
    const [start, end] = selectedDateRange;
    const fmtStart = start ? start.format('MM/DD/YY') : null;
    const fmtEnd = end ? end.format('MM/DD/YY') : null;
    const [selectedDateStrings, setSelectedDateStrings] = useState([
        fmtStart,
        fmtEnd,
    ]);

    const label =
        selectedDateStrings[0] || selectedDateStrings[1]
            ? `${selectedDateStrings[0] || '?'} - ${
                  selectedDateStrings[1] || '?'
              }`
            : 'Select Range';

    const onChange = (dates, dateStrings) => {
        if (!dates) {
            setSelectedDateRange([null, null]);
            setSelectedDateStrings([null, null]);
        } else {
            setSelectedDateRange(() => dates);
            setSelectedDateStrings(dateStrings);
        }
    };

    return (
        <Popover
            title="Select a Date Range"
            content={
                <DatePicker.RangePicker
                    value={selectedDateRange}
                    format="MM/DD/YY"
                    onChange={onChange}
                    allowEmpty={[true, true]}
                />
            }
            placement="topRight"
            trigger="click"
        >
            <Button className={cx('timeline__range--button')}>{label}</Button>
        </Popover>
    );
};

const hrStyle = {
    borderBottom: '1px solid #bfbfbf',
    marginTop: 12,
    marginBottom: 26,
    width: '100%',
};

const filteringOptions = [
    { label: 'Transaction', value: 'transaction' },
    { label: 'Memo', value: 'memo' },
];

const FunctionalTimeline = (props) => {
    const { data: mainData, properties } = props;
    const data = mainData?.data || {};
    const accountEvents = data?.accountEvents?.events || [];
    const { headerTitle, className, fineTune, showFilters = true } = properties;
    const [isTimelineVisible, setIsTimelineVisible] = useState(true);
    const [sortDataFilter, setSortDataFilter] = useState('dateDescending');
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedAttIds, setSelectedAttIds] = useState([]);
    const [selectedDateRange, setSelectedDateRange] = useState([null, null]);
    const [originalDimensions, setOriginalDimensions] = useState({
        customerHeaderWidth: null,
        customerTabsWidth: null,
        customerJourneyTransform: null,
        customerJourneyWidth: null,
    });

    const { composeElement, cx } = new FineTune(
        className,
        fineTune?.overrideTypeName || '_timeline',
        fineTune
    );
    const Row = composeElement(AntRow);
    const Col = composeElement(AntCol);
    const dropdownOnClick = useCallback(({ key }) => {
        setSortDataFilter(key);
    }, []);
    const timestampedData = useMemo(() => getDataWithTimestamp(accountEvents), [
        accountEvents,
    ]);

    let attIds = [];
    accountEvents.map(({ performedBy }) => {
        if (!attIds.includes(performedBy)) {
            attIds.push(performedBy);
        }
    });

    const attIdOptions = attIds?.map((id) => {
        return { value: id, label: id };
    });

    const [sortedData, descending] = useMemo(
        () =>
            handleSortChange(
                timestampedData,
                sortDataFilter,
                selectedDateRange
            ),
        [timestampedData, sortDataFilter, selectedDateRange]
    );
    const groupedData = useMemo(() => groupByDate(sortedData, descending), [
        sortedData,
        descending,
    ]);

    const filteredData = useMemo(
        () => filterDataWithText(groupedData, searchText),
        [groupedData, searchText]
    );
    const timelineData = useMemo(() => mapTimelines(filteredData, Row, Col), [
        filteredData,
    ]);

    // const handleSelectChange = useCallback((value, type) => {
    //     if (type === 'performedBy') {
    //         setSelectedAttIds(value);
    //     } else {
    //         setSelectedOptions(value);
    //     }
    // }, []);

    const handleSearchText = (e) => {
        e.preventDefault();
        setSearchText(e.target.value);
    };

    const toggleView = () => {
        const customerHeaderContainer = document.getElementById(
            'customer-header'
        );
        const customerTabsContainer = document.getElementById('customer-tabs');
        const customerJourneyContainer = document.getElementById(
            'customer-journey'
        );

        if (customerHeaderContainer.style.width === '0px') {
            customerHeaderContainer.style.width =
                originalDimensions?.customerHeaderWidth;
            customerTabsContainer.style.width =
                originalDimensions?.customerTabsWidth;
            customerJourneyContainer.style.width =
                originalDimensions?.customerJourneyWidth;
            customerJourneyContainer.style.transform =
                originalDimensions?.customerJourneyTransform;
            const customerJourneyChild = customerJourneyContainer.getElementsByClassName(
                'customer-journey'
            );
            customerJourneyChild[0].style.width = '100%';
            customerJourneyChild[0].style.margin = 'none';
            customerJourneyChild[0].style.borderLeft = '0.5px solid #8c8c8c;';
            setOriginalDimensions({
                customerHeaderWidth: null,
                customerTabsWidth: null,
                customerJourneyTransform: null,
            });
        } else {
            setOriginalDimensions({
                ...originalDimensions,
                customerHeaderWidth: customerHeaderContainer.style.width,
                customerTabsWidth: customerTabsContainer.style.width,
                customerJourneyTransform:
                    customerJourneyContainer.style.transform,
                customerJourneyWidth: customerJourneyContainer.style.width,
            });
            const customerJourneyChild = customerJourneyContainer.getElementsByClassName(
                'customer-journey'
            );
            customerJourneyChild[0].style.width = '70%';
            customerJourneyChild[0].style.margin = 'auto';
            customerJourneyChild[0].style.border = 'none';
            customerHeaderContainer.style.width = '0px';
            customerTabsContainer.style.width = '0px';
            customerJourneyContainer.style.width = '100%';
            customerJourneyContainer.style.transform = 'translate(0, 0)';
            customerJourneyContainer.style.backgroundColor = '#f3f2f1';
        }
    };

    return (
        <>
            {showFilters ? (
                <>
                    <Col ft="wrapperCol">
                        <Row ft="headerRow">
                            <Col ft="headerRow.cols.titleCol">
                                {headerTitle}
                            </Col>
                            <Col>
                                <Row
                                    style={{
                                        justifyContent: 'flex-start',
                                        gap: '20px',
                                    }}
                                >
                                    <Col
                                        ft="headerRow.cols.iconCol"
                                        onClick={() =>
                                            setIsTimelineVisible(
                                                !isTimelineVisible
                                            )
                                        }
                                    >
                                        {isTimelineVisible ? (
                                            <EyeInvisibleOutlined />
                                        ) : (
                                            <EyeOutlined />
                                        )}
                                    </Col>
                                    <Col ft="headerRow.cols.iconCol">
                                        {originalDimensions?.customerHeaderWidth ===
                                        null ? (
                                            <ArrowsAltOutlined
                                                onClick={toggleView}
                                            />
                                        ) : (
                                            <ShrinkOutlined
                                                onClick={toggleView}
                                            />
                                        )}
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Col>

                    <div
                        style={{
                            backgroundColor: '#F3F2F1',
                            padding: '20px 0',
                        }}
                    >
                        <div style={{ width: '80%', marginLeft: '6%' }}>
                            <Space>
                                <Input
                                    allowClear
                                    value={searchText}
                                    onChange={handleSearchText}
                                    placeholder="Search"
                                />
                                <DateRange
                                    cx={cx}
                                    selectedDateRange={selectedDateRange}
                                    setSelectedDateRange={setSelectedDateRange}
                                />
                            </Space>
                        </div>
                    </div>

                    {/* <Col  ft="wrapperCol">
                    <Row ft="searchRow">
                        <Col>
                            <SortDropdown dropdownOnClick={dropdownOnClick} />
                        </Col>
                    </Row>

                    <Row style={hrStyle} />
                </Col> */}
                </>
            ) : null}
            <Col ft="wrapperCol2">
                <Row ft="timelineWrapper">
                    {timelineData.length ? (
                        timelineData
                    ) : (
                        <Row ft="noData">
                            <Col ft="noData.cols.span">
                                No items were found matching the selected
                                filter(s).
                            </Col>
                        </Row>
                    )}
                </Row>
            </Col>
        </>
    );
};

export default FunctionalTimeline;

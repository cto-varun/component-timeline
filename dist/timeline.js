"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _icons = require("@ant-design/icons");
var _momentTimezone = _interopRequireDefault(require("moment-timezone"));
var _fineTune = _interopRequireDefault(require("../../../../src/utils/fineTune"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/* eslint-disable react/jsx-props-no-spreading */

const timezone = 'America/New_York'; // This should ideally come from config
const dataTZ = 'America/Chicago'; // This should ideally come from config

const ICON_REGEX = [{
  icon: _icons.CustomerServiceOutlined,
  regex: /phone interaction/,
  buttonLabel: 'memo'
}, {
  icon: _icons.DollarCircleOutlined,
  regex: /payment/,
  buttonLabel: 'details'
}, {
  icon: _icons.MessageOutlined,
  regex: /chat/,
  buttonLabel: 'memo'
}, {
  icon: _icons.ContactsOutlined,
  regex: /customer|update/,
  buttonLabel: 'details'
}, {
  icon: _icons.TagOutlined,
  regex: /promo/,
  buttonLabel: 'details'
}];
const handleIcon = (type, description) => {
  const stringToTest = `${type} ${description}`.toLowerCase();
  for (let i = 0; i < ICON_REGEX.length; i += 1) {
    const current = ICON_REGEX[i];
    const containsKeyword = current.regex.test(stringToTest);
    if (containsKeyword) return [current.icon, current.buttonLabel];
  }
  return [_icons.AuditOutlined, 'memo'];
};
const TimelineItem = _ref => {
  let {
    memoItem: {
      type = '',
      description = '',
      formattedDate,
      performedBy,
      manualText = '',
      ptn,
      applicationId
    },
    composers: [Row, Col],
    showDescriptionByDefault
  } = _ref;
  const [DotIcon, typeSuffix] = handleIcon(type, description);
  const customerHeaderContainer = document.getElementById('customer-header');
  const [descriptionVisible, setDescriptionVisible] = (0, _react.useState)(customerHeaderContainer?.style?.width === '0px' ? true : showDescriptionByDefault);
  const buttonLabel = `VIEW ${typeSuffix}`.toUpperCase();
  const {
    date
  } = formattedDate;
  const memoTitle = `${type[0].toUpperCase()}${type.slice(1)}`;
  return /*#__PURE__*/_react.default.createElement(_antd.Timeline.Item, {
    dot: /*#__PURE__*/_react.default.createElement(DotIcon, {
      className: "timeline__dot--icon"
    })
  }, /*#__PURE__*/_react.default.createElement(Row, {
    ft: "eventType"
  }, memoTitle), /*#__PURE__*/_react.default.createElement(Row, {
    ft: "memoWrapper"
  }, /*#__PURE__*/_react.default.createElement(Col, {
    ft: "memoWrapper.rows.eventDate"
  }, date), performedBy && /*#__PURE__*/_react.default.createElement(Col, {
    ft: "memoWrapper.rows.eventDate"
  }, "Performed By: ", performedBy), applicationId && /*#__PURE__*/_react.default.createElement(Col, {
    ft: "memoWrapper.rows.eventDate"
  }, "Application Id: ", applicationId), ptn && /*#__PURE__*/_react.default.createElement(Col, {
    ft: "memoWrapper.rows.eventDate"
  }, "CTN: ", ptn), manualText && /*#__PURE__*/_react.default.createElement(Col, {
    ft: "memoWrapper.rows.eventDate"
  }, "Manual Text: ", manualText), description && description === 'Cancellation - Port Out' && /*#__PURE__*/_react.default.createElement(Col, {
    ft: "memoWrapper.rows.portOut",
    style: {
      color: '#f00 !important'
    }
  }, description), /*#__PURE__*/_react.default.createElement(Col, {
    ft: "memoWrapper.rows.buttonWrapper"
  }, description ? /*#__PURE__*/_react.default.createElement(Row, {
    ft: "memoWrapper.rows.viewButton"
  }, /*#__PURE__*/_react.default.createElement("div", {
    onClick: () => setDescriptionVisible(true)
  }, descriptionVisible ? description : buttonLabel)) : null)));
};
const getDate = (val, date) => {
  if (val) {
    const time = val + -1 * new _momentTimezone.default(date).tz(dataTZ).utcOffset() * 60 * 1000;
    return (0, _momentTimezone.default)(time).tz(timezone);
  }
  return (0, _momentTimezone.default)();
};
const getDataWithTimestamp = data => data?.map(item => {
  const itemDate = getDate(item.timestamp ? parseInt(item.timestamp) : '', item.date || '01-01-1970');
  return {
    ...item,
    formattedDate: {
      moment: itemDate,
      date: itemDate.format('MMM D, YYYY hh:mm:ss a')
    }
  };
});
const compareByDateRange = (currentDate, _ref2) => {
  let [beginDate, endDate] = _ref2;
  const newEndDate = (0, _momentTimezone.default)(endDate).startOf('day').add(1, 'days');
  const newBeginDate = (0, _momentTimezone.default)(beginDate).startOf('day');
  const newcurrentDate = (0, _momentTimezone.default)(currentDate).startOf('day');
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
const sortData = (d, sortOrder, dateRanges) => d?.sort((a, b) => sortOrder === 'asc' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp)?.filter(item => compareByDateRange(item?.formattedDate?.moment, dateRanges));
const groupByDate = function (data) {
  let descending = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  const groupByYearMonth = data?.reduce((acc, item) => {
    const ym = item.formattedDate.moment.format('YYYYMM');
    acc[ym] = acc[ym] ? [...acc[ym], item] : [item];
    return acc;
  }, {});
  return Object.keys(groupByYearMonth)?.sort((a, b) => descending ? b - a : a - b)?.map(k => groupByYearMonth[k])?.filter(d => d.length);
};
const filterData = (unfilteredData, filterTypes, filterIds) => {
  let finalFilteredData = unfilteredData;
  if (filterTypes.length > 0) {
    const filteredData = unfilteredData.map(dataItem => {
      const filteredDataItem = dataItem?.filter(item => filterTypes.includes(item?.type));
      if (filteredDataItem.length > 0) {
        return filteredDataItem;
      }
      return null;
    });
    finalFilteredData = filteredData.filter(item => item);
  }
  if (filterIds.length > 0) {
    let filteredDataWithIds = [];
    finalFilteredData.map(dataItem => {
      const filteredDataItem = dataItem?.filter(item => filterIds.includes(item?.performedBy));
      filteredDataItem.length > 0 && filteredDataWithIds.push(filteredDataItem);
    });
    finalFilteredData = filteredDataWithIds.filter(item => item);
  }
  return finalFilteredData;
};
const filterDataWithText = function (unfilteredData) {
  let searchText = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  let finalFilteredData = unfilteredData;
  let filteredData;
  if (searchText === '') {
    filteredData = unfilteredData.map(dataItem => dataItem.length > 0 ? dataItem : null);
  } else {
    filteredData = unfilteredData.map(dataItem => {
      const filteredDataItem = dataItem?.filter(item => item?.description?.toLowerCase()?.includes(searchText?.toLowerCase()));
      if (filteredDataItem.length > 0) {
        return filteredDataItem;
      }
      return null;
    });
  }
  finalFilteredData = filteredData.filter(item => item);
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
const mapTimelines = function () {
  let groupedData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  let Row = arguments.length > 1 ? arguments[1] : undefined;
  let Col = arguments.length > 2 ? arguments[2] : undefined;
  return groupedData?.map((data, index) => {
    const dateInfo = data[0].formattedDate;
    const groupTitle = `${dateInfo.moment.format('MMM YYYY')}`.toUpperCase();
    const showDescriptionByDefault = index === 0;
    return /*#__PURE__*/_react.default.createElement(Row, {
      key: index,
      ft: "timelineGroupWrapper"
    }, /*#__PURE__*/_react.default.createElement(Col, {
      ft: "timelineGroupWrapper.rows.groupTitle"
    }, groupTitle), /*#__PURE__*/_react.default.createElement(Col, {
      ft: "timelineGroupWrapper.rows.elementWrapper"
    }, /*#__PURE__*/_react.default.createElement(_antd.Timeline, {
      mode: "left"
    }, data.map((memoItem, dataIndex) => /*#__PURE__*/_react.default.createElement(TimelineItem, {
      key: dataIndex,
      memoItem: memoItem,
      composers: [Row, Col],
      showDescriptionByDefault: showDescriptionByDefault
    })))));
  });
};
const SortDropdown = _ref3 => {
  let {
    dropdownOnClick
  } = _ref3;
  return /*#__PURE__*/_react.default.createElement(_antd.Dropdown, {
    menu: /*#__PURE__*/_react.default.createElement(_antd.Menu, {
      onClick: dropdownOnClick
    }, /*#__PURE__*/_react.default.createElement(_antd.Menu.Item, {
      key: "dateAscending"
    }, "Date (Ascending)"), /*#__PURE__*/_react.default.createElement(_antd.Menu.Item, {
      key: "dateDescending"
    }, "Date (Descending)"))
  }, /*#__PURE__*/_react.default.createElement("div", {
    style: {
      color: '#595959',
      fontSize: 12,
      cursor: 'pointer'
    }
  }, "SORT BY ", /*#__PURE__*/_react.default.createElement(_icons.DownOutlined, null)));
};
const DateRange = _ref4 => {
  let {
    cx,
    selectedDateRange,
    setSelectedDateRange
  } = _ref4;
  const [start, end] = selectedDateRange;
  const fmtStart = start ? start.format('MM/DD/YY') : null;
  const fmtEnd = end ? end.format('MM/DD/YY') : null;
  const [selectedDateStrings, setSelectedDateStrings] = (0, _react.useState)([fmtStart, fmtEnd]);
  const label = selectedDateStrings[0] || selectedDateStrings[1] ? `${selectedDateStrings[0] || '?'} - ${selectedDateStrings[1] || '?'}` : 'Select Range';
  const onChange = (dates, dateStrings) => {
    if (!dates) {
      setSelectedDateRange([null, null]);
      setSelectedDateStrings([null, null]);
    } else {
      setSelectedDateRange(() => dates);
      setSelectedDateStrings(dateStrings);
    }
  };
  return /*#__PURE__*/_react.default.createElement(_antd.Popover, {
    title: "Select a Date Range",
    content: /*#__PURE__*/_react.default.createElement(_antd.DatePicker.RangePicker, {
      value: selectedDateRange,
      format: "MM/DD/YY",
      onChange: onChange,
      allowEmpty: [true, true]
    }),
    placement: "topRight",
    trigger: "click"
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    className: cx('timeline__range--button')
  }, label));
};
const hrStyle = {
  borderBottom: '1px solid #bfbfbf',
  marginTop: 12,
  marginBottom: 26,
  width: '100%'
};
const filteringOptions = [{
  label: 'Transaction',
  value: 'transaction'
}, {
  label: 'Memo',
  value: 'memo'
}];
const FunctionalTimeline = props => {
  const {
    data: mainData,
    properties
  } = props;
  const data = mainData?.data || {};
  const accountEvents = data?.accountEvents?.events || [];
  const {
    headerTitle,
    className,
    fineTune,
    showFilters = true
  } = properties;
  const [isTimelineVisible, setIsTimelineVisible] = (0, _react.useState)(true);
  const [sortDataFilter, setSortDataFilter] = (0, _react.useState)('dateDescending');
  const [selectedOptions, setSelectedOptions] = (0, _react.useState)([]);
  const [searchText, setSearchText] = (0, _react.useState)('');
  const [selectedAttIds, setSelectedAttIds] = (0, _react.useState)([]);
  const [selectedDateRange, setSelectedDateRange] = (0, _react.useState)([null, null]);
  const [originalDimensions, setOriginalDimensions] = (0, _react.useState)({
    customerHeaderWidth: null,
    customerTabsWidth: null,
    customerJourneyTransform: null,
    customerJourneyWidth: null
  });
  const {
    composeElement,
    cx
  } = new _fineTune.default(className, fineTune?.overrideTypeName || '_timeline', fineTune);
  const Row = composeElement(_antd.Row);
  const Col = composeElement(_antd.Col);
  const dropdownOnClick = (0, _react.useCallback)(_ref5 => {
    let {
      key
    } = _ref5;
    setSortDataFilter(key);
  }, []);
  const timestampedData = (0, _react.useMemo)(() => getDataWithTimestamp(accountEvents), [accountEvents]);
  let attIds = [];
  accountEvents.map(_ref6 => {
    let {
      performedBy
    } = _ref6;
    if (!attIds.includes(performedBy)) {
      attIds.push(performedBy);
    }
  });
  const attIdOptions = attIds?.map(id => {
    return {
      value: id,
      label: id
    };
  });
  const [sortedData, descending] = (0, _react.useMemo)(() => handleSortChange(timestampedData, sortDataFilter, selectedDateRange), [timestampedData, sortDataFilter, selectedDateRange]);
  const groupedData = (0, _react.useMemo)(() => groupByDate(sortedData, descending), [sortedData, descending]);
  const filteredData = (0, _react.useMemo)(() => filterDataWithText(groupedData, searchText), [groupedData, searchText]);
  const timelineData = (0, _react.useMemo)(() => mapTimelines(filteredData, Row, Col), [filteredData]);

  // const handleSelectChange = useCallback((value, type) => {
  //     if (type === 'performedBy') {
  //         setSelectedAttIds(value);
  //     } else {
  //         setSelectedOptions(value);
  //     }
  // }, []);

  const handleSearchText = e => {
    e.preventDefault();
    setSearchText(e.target.value);
  };
  const toggleView = () => {
    const customerHeaderContainer = document.getElementById('customer-header');
    const customerTabsContainer = document.getElementById('customer-tabs');
    const customerJourneyContainer = document.getElementById('customer-journey');
    if (customerHeaderContainer.style.width === '0px') {
      customerHeaderContainer.style.width = originalDimensions?.customerHeaderWidth;
      customerTabsContainer.style.width = originalDimensions?.customerTabsWidth;
      customerJourneyContainer.style.width = originalDimensions?.customerJourneyWidth;
      customerJourneyContainer.style.transform = originalDimensions?.customerJourneyTransform;
      const customerJourneyChild = customerJourneyContainer.getElementsByClassName('customer-journey');
      customerJourneyChild[0].style.width = '100%';
      customerJourneyChild[0].style.margin = 'none';
      customerJourneyChild[0].style.borderLeft = '0.5px solid #8c8c8c;';
      setOriginalDimensions({
        customerHeaderWidth: null,
        customerTabsWidth: null,
        customerJourneyTransform: null
      });
    } else {
      setOriginalDimensions({
        ...originalDimensions,
        customerHeaderWidth: customerHeaderContainer.style.width,
        customerTabsWidth: customerTabsContainer.style.width,
        customerJourneyTransform: customerJourneyContainer.style.transform,
        customerJourneyWidth: customerJourneyContainer.style.width
      });
      const customerJourneyChild = customerJourneyContainer.getElementsByClassName('customer-journey');
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
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, showFilters ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(Col, {
    ft: "wrapperCol"
  }, /*#__PURE__*/_react.default.createElement(Row, {
    ft: "headerRow"
  }, /*#__PURE__*/_react.default.createElement(Col, {
    ft: "headerRow.cols.titleCol"
  }, headerTitle), /*#__PURE__*/_react.default.createElement(Col, null, /*#__PURE__*/_react.default.createElement(Row, {
    style: {
      justifyContent: 'flex-start',
      gap: '20px'
    }
  }, /*#__PURE__*/_react.default.createElement(Col, {
    ft: "headerRow.cols.iconCol",
    onClick: () => setIsTimelineVisible(!isTimelineVisible)
  }, isTimelineVisible ? /*#__PURE__*/_react.default.createElement(_icons.EyeInvisibleOutlined, null) : /*#__PURE__*/_react.default.createElement(_icons.EyeOutlined, null)), /*#__PURE__*/_react.default.createElement(Col, {
    ft: "headerRow.cols.iconCol"
  }, originalDimensions?.customerHeaderWidth === null ? /*#__PURE__*/_react.default.createElement(_icons.ArrowsAltOutlined, {
    onClick: toggleView
  }) : /*#__PURE__*/_react.default.createElement(_icons.ShrinkOutlined, {
    onClick: toggleView
  })))))), /*#__PURE__*/_react.default.createElement("div", {
    style: {
      backgroundColor: '#F3F2F1',
      padding: '20px 0'
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    style: {
      width: '80%',
      marginLeft: '6%'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Space, null, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    allowClear: true,
    value: searchText,
    onChange: handleSearchText,
    placeholder: "Search"
  }), /*#__PURE__*/_react.default.createElement(DateRange, {
    cx: cx,
    selectedDateRange: selectedDateRange,
    setSelectedDateRange: setSelectedDateRange
  }))))) : null, /*#__PURE__*/_react.default.createElement(Col, {
    ft: "wrapperCol2"
  }, /*#__PURE__*/_react.default.createElement(Row, {
    ft: "timelineWrapper"
  }, timelineData.length ? timelineData : /*#__PURE__*/_react.default.createElement(Row, {
    ft: "noData"
  }, /*#__PURE__*/_react.default.createElement(Col, {
    ft: "noData.cols.span"
  }, "No items were found matching the selected filter(s).")))));
};
var _default = FunctionalTimeline;
exports.default = _default;
module.exports = exports.default;
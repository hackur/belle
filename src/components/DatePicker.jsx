import React, {Component} from 'react';
import {injectStyles, removeAllStyles} from '../utils/inject-style';
import unionClassNames from '../utils/union-class-names';
import {has, extend, map, shift, reverse} from '../utils/helpers';
import {getWeekArrayForMonth, CURRENT_DATE, CURRENT_MONTH, CURRENT_YEAR, getLocaleData} from '../utils/date-helpers';
import style from '../style/date-picker';
import config from '../config/datePicker';

// Enable React Touch Events
React.initializeTouchEvents(true);

/**
 * DatePicker React Component.
 */
export default class DatePicker extends Component {

  constructor(properties) {
    super(properties);
    let dateValue;

    if (has(properties, 'valueLink')) {
      dateValue = properties.valueLink.value;
    } else if (has(properties, 'value')) {
      dateValue = properties.value;
    } else if (has(properties, 'defaultValue')) {
      dateValue = properties.defaultValue;
    }

    this.state = {
      dateValue: dateValue,
      month: properties.month - 1,
      year: properties.year,
      localeData: getLocaleData(properties.locale)
    };

    this.preventFocusStyleForTouchAndClick = has(properties, 'preventFocusStyleForTouchAndClick') ? properties.preventFocusStyleForTouchAndClick : config.preventFocusStyleForTouchAndClick;
  }

  static displayName = 'Belle DatePicker';

  static propTypes = {
    defaultValue: React.PropTypes.instanceOf(Date),
    value: React.PropTypes.instanceOf(Date),
    valueLink: React.PropTypes.shape({
      value: React.PropTypes.instanceOf(Date),
      requestChange: React.PropTypes.func.isRequired
    }),
    locale: React.PropTypes.string,
    month: React.PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
    year: React.PropTypes.number,
    showOtherMonthDate: React.PropTypes.bool,
    styleWeekend: React.PropTypes.bool,
    renderDay: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onBlur: React.PropTypes.func,
    onKeyDown: React.PropTypes.func,
    onDayFocus: React.PropTypes.func,
    onDayBlur: React.PropTypes.func,
    onDayKeyDown: React.PropTypes.func,
    onDayMouseDown: React.PropTypes.func,
    onDayMouseUp: React.PropTypes.func,
    onDayTouchStart: React.PropTypes.func,
    onDayTouchEnd: React.PropTypes.func,
    onUpdate: React.PropTypes.func,
    onMonthChange: React.PropTypes.func,
    tabIndex: React.PropTypes.number,
    'aria-label': React.PropTypes.string,
    disabled: React.PropTypes.bool,
    readOnly: React.PropTypes.bool,
    'preventFocusStyleForTouchAndClick': React.PropTypes.bool,
    // ClassNames
    wrapperClassName: React.PropTypes.string,
    navBarClassName: React.PropTypes.string,
    prevMonthNavClassName: React.PropTypes.string,
    nextMonthNavClassName: React.PropTypes.string,
    monthLblClassName: React.PropTypes.string,
    dayLblClassName: React.PropTypes.string,
    weekClassName: React.PropTypes.string,
    dayClassName: React.PropTypes.string,
    // wrapper styles
    wrapperStyle: React.PropTypes.object,
    disabledWrapperStyle: React.PropTypes.object,
    readOnlyWrapperStyle: React.PropTypes.object,
    hoverWrapperStyle: React.PropTypes.object,
    activeWrapperStyle: React.PropTypes.object,
    focusWrapperStyle: React.PropTypes.object,
    disabledHoverWrapperStyle: React.PropTypes.object,
    // navbar styles
    navBarStyle: React.PropTypes.object,
    // prevMonthNav styles
    prevMonthNavStyle: React.PropTypes.object,
    hoverPrevMonthNavStyle: React.PropTypes.object,
    activePrevMonthNavStyle: React.PropTypes.object,
    // nextMonthNav styles
    nextMonthNavStyle: React.PropTypes.object,
    hoverNextMonthNavStyle: React.PropTypes.object,
    activeNextMonthNavStyle: React.PropTypes.object,
    // monthlbl styles
    monthLblStyle: React.PropTypes.object,
    // week header style
    weekHeaderStyle: React.PropTypes.object,
    // week style
    weekStyle: React.PropTypes.object,
    // daylbl styles
    dayLblStyle: React.PropTypes.object,
    disabledDayLblStyle: React.PropTypes.object,
    weekendLblStyle: React.PropTypes.object,
    // day styles
    dayStyle: React.PropTypes.object,
    disabledDayStyle: React.PropTypes.object,
    readOnlyDayStyle: React.PropTypes.object,
    hoverDayStyle: React.PropTypes.object,
    activeDayStyle: React.PropTypes.object,
    focusDayStyle: React.PropTypes.object,
    disabledHoverDayStyle: React.PropTypes.object,
    todayStyle: React.PropTypes.object,
    selectedDayStyle: React.PropTypes.object,
    otherMonthDayStyle: React.PropTypes.object,
    weekendStyle: React.PropTypes.object
  };

  static defaultProps = {
    month: CURRENT_MONTH + 1,
    year: CURRENT_YEAR,
    tabIndex: 0,
    'aria-label': 'DatePicker',
    disabled: false,
    readOnly: false,
    locale: 'en',
    showOtherMonthDate: true,
    styleWeekend: false
  };

  /**
   * Injects pseudo classes for styles into the DOM.
   */
  static updatePseudoClassStyle(pseudoStyleIds, properties, preventFocusStyleForTouchAndClick) {
    const styles = [];
    ['navBar', 'prevMonthNav', 'nextMonthNav', 'monthLbl', 'dayLbl', 'weekHeader'].forEach((elm) => {
      const elmFirstCaps = elm[0].toUpperCase() + elm.substr(1, elm.length);
      styles.push({
        id: pseudoStyleIds[elm + 'StyleId'],
        style: extend({}, style['hover' + elmFirstCaps + 'Style'], properties['hover' + elmFirstCaps + 'Style']),
        pseudoClass: 'hover'
      });
    });
    ['wrapper', 'navBar', 'prevMonthNav', 'nextMonthNav', 'monthLbl', 'dayLbl', 'weekHeader', 'day'].forEach((elm) => {
      const elmFirstCaps = elm[0].toUpperCase() + elm.substr(1, elm.length);
      let focusStyle;
      if (preventFocusStyleForTouchAndClick && elm !== 'day') {
        focusStyle = { outline: 0 };
      } else {
        focusStyle = extend({}, style['focus' + elmFirstCaps + 'Style'], properties['focus' + elmFirstCaps + 'Style']);
      }
      styles.push({
        id: pseudoStyleIds[elm + 'StyleId'],
        style: focusStyle,
        pseudoClass: 'focus'
      });
    });
    injectStyles(styles);
  }

  /**
   * Generates the style-id based on React's unique DOM node id.
   * Calls function to inject the pseudo classes into the dom.
   */
  componentWillMount() {
    const id = this._reactInternalInstance._rootNodeID.replace(/\./g, '-');
    this.pseudoStyleIds = {};
    this.pseudoStyleIds.wrapperStyleId = `wrapper-style-id${id}`;
    this.pseudoStyleIds.navBarStyleId = `navBar-style-id${id}`;
    this.pseudoStyleIds.prevMonthNavStyleId = `prevMonthNav-style-id${id}`;
    this.pseudoStyleIds.nextMonthNavStyleId = `nextMonthNav-style-id${id}`;
    this.pseudoStyleIds.monthLblStyleId = `monthLbl-style-id${id}`;
    this.pseudoStyleIds.dayLblStyleId = `dayLbl-style-id${id}`;
    this.pseudoStyleIds.dayStyleId = `day-style-id${id}`;
    DatePicker.updatePseudoClassStyle(this.pseudoStyleIds, this.props, this.preventFocusStyleForTouchAndClick);
  }

  /**
   * FUnction will update component state and styles as new props are received.
   */
  componentWillReceiveProps(properties) {
    const newState = {
      month: properties.month - 1,
      year: properties.year,
      localeData: getLocaleData(properties.locale)
    };

    if (has(properties, 'valueLink')) {
      newState.dateValue = properties.valueLink.value;
    } else if (has(properties, 'value')) {
      newState.dateValue = properties.value;
    }

    this.setState(newState);
    this.preventFocusStyleForTouchAndClick = has(properties, 'preventFocusStyleForTouchAndClick') ? properties.preventFocusStyleForTouchAndClick : config.preventFocusStyleForTouchAndClick;

    removeAllStyles(Object.keys(this.pseudoStyleIds));
    DatePicker.updatePseudoClassStyle(this.pseudoStyleIds, properties, this.preventFocusStyleForTouchAndClick);
  }

  /**
   * Removes pseudo classes from the DOM once component gets removed.
   */
  componentWillUnmount() {
    removeAllStyles(Object.keys(this.pseudoStyleIds));
  }

  /**
   * Callback is called when wrapper is focused.
   * It will conditionally set isWrapperFocused and call props.onFocus.
   */
  _onWrapperFocus(event) {
    if (!this.props.disabled && !this.state.isWrapperActive) {
      this.setState({
        isWrapperFocused: true
      });
    }

    if (this.props.onFocus) {
      this.props.onFocus(event);
    }
  }

  /**
   * Callback is called when wrapper is blurred.
   * It will reset isWrapperFocused and call props.onBlur.
   */
  _onWrapperBlur(event) {
    if (!this.props.disabled) {
      this.setState({
        isWrapperFocused: false
      });
    }

    if (this.props.onBlur) {
      this.props.onBlur(event);
    }
  }

  /**
   * Callback is called when wrapper receives mouseDown.
   * Conditionally set isWrapperActive.
   */
  _onWrapperMouseDown(event) {
    if (!this.props.disabled && event.button === 0) {
      this.setState({
        isWrapperActive: true
      });
    }
  }

  /**
   * Callback is called when wrapper receives mouseUp.
   * Reset isWrapperActive.
   */
  _onWrapperMouseUp(event) {
    if (!this.props.disabled && event.button === 0) {
      this.setState({
        isWrapperActive: false
      });
    }
  }

  /**
   * Callback is called when mouse enters wrapper.
   * Conditionally set isWrapperHovered.
   */
  _onWrapperMouseOver() {
    this.setState({
      isWrapperHovered: true
    });
  }

  /**
   * Callback is called when mouse leaves wrapper.
   * Reset isWrapperHovered.
   */
  _onWrapperMouseOut() {
    this.setState({
      isWrapperHovered: false
    });
  }

  /**
   * Callback is called when touch starts on wrapper.
   * Conditionally sets isWrapperActive.
   */
  _onWrapperTouchStart(event) {
    if (!this.props.disabled && event.touches.length === 1) {
      this.setState({
        isWrapperActive: true
      });
    }
  }

  /**
   * Callback is called when touch ends on wrapper.
   * Reset isWrapperActive.
   */
  _onWrapperTouchEnd() {
    if (!this.props.disabled) {
      this.setState({
        isWrapperActive: false
      });
    }
  }

  /**
   * The callback is called when wrapper receives keyDown event.
   * 1. If wrapper is focused: ArrowLeft/ ArrowRight keys will increase or decrease month.
   * 2. If previousMonth if focused: Enter key will decrease month.
   * 3. If nextMonthNav is focused: Enter key will increase the month.
   * 4. Id some day is focused: arrow keys will navigate calendar and enter key will change dateValue of component.
   * Function will call props.onDayKeyDown or props.onKeyDown depending on whether wrapper or day is focused.
   */
  _onWrapperKeyDown(event) {
    if (!this.props.disabled) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (this.state.focusedDay) {
          this._focusNextDay(7);
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (this.state.focusedDay) {
          this._focusPreviousDay(7);
        }
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (this.state.focusedDay) {
          this._focusPreviousDay(1);
        } else if (this.state.isWrapperFocused) {
          this._decreaseMonth();
        }
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (this.state.focusedDay) {
          this._focusNextDay(1);
        } else if (this.state.isWrapperFocused) {
          this._increaseMonth();
        }
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (this.state.focusedDay) {
          this._selectDate(new Date(this.state.focusedDay).getDate());
        } else if (this.state.isPrevMonthNavFocused) {
          this._decreaseMonth();
        } else if (this.state.isNextMonthNavFocused) {
          this._increaseMonth();
        }
      }
    }

    if (this.state.focusedDay && this.props.onDayKeyDown) {
      this.props.onDayKeyDown(event);
    } if (this.props.onKeyDown) {
      this.props.onKeyDown(event);
    }
  }

  /**
   * Callback is called when some day received focus.
   * It will conditionally set this.state.focusedDay to value of focused day and call props.onDayFocus.
   */
  _onDayFocus(dayKey, event) {
    if (!this.props.disabled && !this.props.readOnly) {
      this.setState({
        focusedDay: dayKey
      });
    }

    if (this.props.onDayFocus) {
      this.props.onDayFocus(event);
    }
  }

  /**
   * Callback is called when some day receives blur.
   * It will reset this.state.focusedDay and call props.onDayBlur.
   */
  _onDayBlur(dayKey, event) {
    if (!this.props.disabled && this.state.focusedDay && this.state.focusedDay === dayKey) {
      this.setState({
        focusedDay: null
      });
    }

    if (this.props.onDayBlur) {
      this.props.onDayBlur(event);
    }
  }

  // mouseEvent.button is supported by all browsers are are targeting: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
  /**
   * Callback is called when some day receives mouseDown.
   * It will conditionally set this.state.activeDay and call props.onDayMouseDown.
   */
  _onDayMouseDown(dayKey, day, event) {
    if (event.button === 0 && !this.props.disabled && !this.props.readOnly) {
      this._selectDate(day);
      this.setState({
        activeDay: dayKey
      });
    }

    if (this.props.onDayMouseDown) {
      this.props.onDayMouseDown(event);
    }
  }

  /**
   * Callback is called when some day receives mouseUp.
   * It will reset this.state.activeDay and call props.onDayMouseUp.
   */
  _onDayMouseUp(dayKey, event) {
    if (event.button === 0 && !this.props.disabled && !this.props.readOnly && this.state.activeDay === dayKey) {
      this.setState({
        activeDay: null
      });
    }

    if (this.props.onDayMouseUp) {
      this.props.onDayMouseUp(event);
    }
  }

  /**
   * Callback is called when some day receives MouseOver.
   * It will conditionally set this.state.hoveredDay.
   */
  _onDayMouseOver(dayKey) {
    if (!this.props.disabled && !this.props.readOnly) {
      this.setState({
        hoveredDay: dayKey
      });
    }
  }

  /**
   * Callback is called when some day receives MouseOut.
   * It will reset this.state.hoveredDay.
   */
  _onDayMouseOut(dayKey, event) {
    if (!this.props.disabled && !this.props.readOnly && event.button === 0 && this.state.hoveredDay === dayKey) {
      this.setState({
        hoveredDay: 0
      });
    }
  }

  /**
   * Callback is called when some day receives touchStart.
   * It will conditionally set this.state.activeDay and call props.onDayTouchStart.
   */
  _onDayTouchStart(dayKey, day, event) {
    if (!this.props.disabled && !this.props.readOnly && event.touches.length === 1) {
      this._selectDate(day);
      this.setState({
        activeDay: dayKey
      });
    }

    if (this.props.onDayTouchStart) {
      this.props.onDayTouchStart(event);
    }
  }

  /**
   * Callback is called when some day receives touchEnd.
   * It will reset this.state.activeDay and call props.onDayTouchEnd.
   */
  _onDayTouchEnd(dayKey, event) {
    if (!this.props.disabled && !this.props.readOnly && event.touches.length === 1 && this.state.activeDay === dayKey) {
      this.setState({
        activeDay: null
      });
    }

    if (this.props.onDayTouchEnd) {
      this.props.onDayTouchEnd(event);
    }
  }

  /**
   * Depending on whether component is controlled or uncontrolled the function will update this.state.dateValue.constructor.
   * It will also call props.onUpdate.
   */
  _selectDate(date) {
    if (!this.props.disabled && !this.props.readOnly) {
      const dateValue = new Date(this.state.year, this.state.month, date);
      if (has(this.props, 'valueLink')) {
        this.props.valueLink.requestChange(dateValue);
      } else if (!has(this.props, 'value')) {
        this.setState({
          dateValue: dateValue
        });
      }

      if (this.props.onUpdate) {
        this.props.onUpdate({
          value: dateValue
        });
      }
    }
  }

  /**
   * Function will return jsx for rendering the nav bar for calendar.
   * Depending on following rules it will apply various styles:
   * 1. If component is readOnly apply readOnly styles
   * 2. If component is disabled apply disabled styles
   * 3. If component is not disabled
   *    - If its active apply activeStyles
   *    - If its not active and is focused also preventFocusStyleForTouchAndClick is true apply focus styles
   * (If preventFocusStyleForTouchAndClick is false focus styles already get applied by pseudo classes).
   */
  _getNavBar() {
    const navBarStyle = extend({}, style.navBarStyle, this.props.navBarStyle);
    let prevMonthNavStyle = extend({}, style.prevMonthNavStyle, this.props.prevMonthNavStyle);
    let nextMonthNavStyle = extend({}, style.nextMonthNavStyle, this.props.nextMonthNavStyle);
    const monthLblStyle = extend({}, style.monthLblStyle, this.props.monthLblStyle);
    if (this.props.disabled) {
      prevMonthNavStyle = {display: 'none'};
      nextMonthNavStyle = {display: 'none'};
    } else {
      if (this.state.isPrevMonthNavActive) {
        prevMonthNavStyle = extend(prevMonthNavStyle, style.activePrevMonthNavStyle, this.props.activePrevMonthNavStyle);
      }
      if (this.state.isNextMonthNavActive) {
        nextMonthNavStyle = extend(nextMonthNavStyle, style.activeNextMonthNavStyle, this.props.activeNextMonthNavStyle);
      }
    }

    return (
      <div style={ navBarStyle }
           className={ unionClassNames(this.props.navBarClassName, this.pseudoStyleIds.navBarStyleId) }>
          <span onMouseDown={ this._onPrevMonthNavMouseDown.bind(this) }
                onMouseUp={ this._onPrevMonthNavMouseUp.bind(this) }
                onTouchStart={ this._onPrevMonthNavTouchStart.bind(this) }
                onTouchEnd={ this._onPrevMonthNavTouchEnd.bind(this) }
                onFocus={ this._onPrevMonthNavFocus.bind(this)}
                onBlur={ this._onPrevMonthNavBlur.bind(this)}
                style= { prevMonthNavStyle }
                className={ unionClassNames(this.props.prevMonthNavClassName, this.pseudoStyleIds.prevMonthNavStyleId) }></span>
          <span style={ monthLblStyle }
                className={ unionClassNames(this.props.monthLblClassName, this.pseudoStyleIds.monthLblStyleId) }
                role="heading"
                id={ this.state.month + '-' + this.state.year }>
            { this.state.localeData.monthNames[this.state.month] + '-' + this.state.year }
          </span>
          <span onMouseDown={ this._onNextMonthNavMouseDown.bind(this) }
                onMouseUp={ this._onNextMonthNavMouseUp.bind(this) }
                onTouchStart={ this._onNextMonthNavTouchStart.bind(this) }
                onTouchEnd={ this._onNextMonthNavTouchEnd.bind(this) }
                onFocus={ this._onNextMonthNavFocus.bind(this)}
                onBlur={ this._onNextMonthNavBlur.bind(this)}
                style= { nextMonthNavStyle }
                className={ unionClassNames(this.props.nextMonthNavClassName, this.pseudoStyleIds.nextMonthNavStyleId) }></span>
      </div>
    );
  }

  /**
   * Function will return jsx for rendering the week header for calendar.
   * Depending on following rules it will apply various styles:
   * 1. If component is readOnly apply readOnly styles
   * 2. If component is disabled apply disabled styles
   */
  _getDaysHeader() {
    let dayLblStyle = extend({}, style.dayLblStyle, this.props.dayLblStyle);
    const weekHeaderStyle = extend({}, style.weekHeaderStyle, this.props.weekHeaderStyle);
    if (this.props.disabled) {
      dayLblStyle = extend(dayLblStyle, style.disabledDayLblStyle, this.props.disabledDayLblStyle);
    }
    const weekendLblStyle = extend({}, dayLblStyle, style.weekendLblStyle, this.props.weekendLblStyle);
    let dayNames = shift(this.state.localeData.dayNamesMin, this.state.localeData.firstDay);
    dayNames = this.state.localeData.isRTL ? reverse(dayNames) : dayNames;

    return (
      <div style={ weekHeaderStyle }>
        {
          map(dayNames, (dayAbbr, index) => {
            let weekendIndex = ((7 - this.state.localeData.firstDay) % 7) + this.state.localeData.weekEnd;
            weekendIndex = this.state.localeData.isRTL ? 6 - weekendIndex : weekendIndex;
            return (
              <span key={ 'dayAbbr-' + index }
                    style={ (this.props.styleWeekend && index === weekendIndex) ? weekendLblStyle : dayLblStyle }
                    className={ unionClassNames(this.props.dayLblClassName, this.pseudoStyleIds.dayLblStyleId) }
                    role="columnheader">
                  { dayAbbr }
                </span>
            );
          })
        }
      </div>
    );
  }

  // According to http://www.w3.org/TR/wai-aria-1.1/#aria-current an empty value for aria-current indicated false.
  /**
   * Function will return jsx for rendering the a day.
   * It will apply various styles in sequence as below (styles will be additive):
   * 1. If component is readOnly apply readOnly styles
   * 2. If component is disabled apply disabled styles
   *    - If component is disabled and hovered apply diableHover styles
   * 3. If its day in current month and component is not disabled or readOnly:
   *    - If component is hovered apply hover styles
   *    - If component is hovered and active apply hoveredStyles + activeStyles
   *    - If component is hovered and not active but focused and preventFocusStyleForTouchAndClick apply focus styles
   * 4. If current day represents other months day in calendar apply otherMonthDayStyle
   * 5. If its current day apply todayStyle
   * 6. If this is selected day apply selectedDayStyle
   */
  _getDayFragment(currentDate, index) {
    const day = currentDate.getDate();
    const isCurrentMonth = currentDate.getMonth() === this.state.month;
    const dayKey = (currentDate.getMonth() + 1) + '/' + currentDate.getDate() + '/' + currentDate.getFullYear();

    const dateValue = this.state.dateValue;

    let ariaCurrent = '';
    let ariaSelected = false;

    let dayStyle = extend({}, style.dayStyle, this.props.dayStyle);

    if (this.props.readOnly) {
      dayStyle = extend(dayStyle, style.readOnlyDayStyle, this.props.readOnlyDayStyle);
    }

    if (this.props.disabled) {
      dayStyle = extend(dayStyle, style.disabledDayStyle, this.props.disabledDayStyle);
      if (isCurrentMonth && this.state.hoveredDay === dayKey) {
        dayStyle = extend(dayStyle, style.disabledHoverDayStyle, this.props.disabledHoverDayStyle);
      }
    }

    if (this.props.styleWeekend && currentDate.getDay() === this.state.localeData.weekEnd) {
      dayStyle = extend(dayStyle, style.weekendStyle, this.props.weekendStyle);
    }

    if (!isCurrentMonth) {
      dayStyle = extend(dayStyle, style.otherMonthDayStyle, this.props.otherMonthDayStyle);
    } else {
      if (isCurrentMonth && !this.props.readOnly && !this.props.disabled) {
        if (this.state.hoveredDay === dayKey) {
          dayStyle = extend(dayStyle, style.hoverDayStyle, this.props.hoverDayStyle);
        }
        if (this.state.activeDay === dayKey) {
          dayStyle = extend(dayStyle, style.activeDayStyle, this.props.activeDayStyle);
        }
      }
    }

    if (this.state.activeDay !== dayKey && dateValue && day === dateValue.getDate() && this.state.month === dateValue.getMonth() && dateValue.getMonth() === currentDate.getMonth() && this.state.year === dateValue.getFullYear()) {
      dayStyle = extend(dayStyle, style.selectedDayStyle, this.props.selectedDayStyle);
      ariaSelected = true;
    }

    // Setting tabIndex
    let tabIndex = false;

    if (day === CURRENT_DATE && isCurrentMonth && this.state.year === currentDate.getFullYear()) {
      dayStyle = extend(dayStyle, style.todayStyle, this.props.todayStyle);
      ariaCurrent = 'date';
      tabIndex = (!this.props.disabled && !this.props.readOnly) ? this.props.tabIndex : false;
    }

    return isCurrentMonth ? (<span tabIndex={ tabIndex }
              key={ 'day-' + index }
              ref={ 'day-' + dayKey }
              onMouseDown={ this._onDayMouseDown.bind(this, dayKey, day) }
              onMouseUp={ this._onDayMouseUp.bind(this, dayKey) }
              onMouseOver={ this._onDayMouseOver.bind(this, dayKey) }
              onMouseOut={ this._onDayMouseOut.bind(this, dayKey) }
              onTouchStart={ this._onDayTouchStart.bind(this, dayKey, day) }
              onTouchEnd={ this._onDayTouchEnd.bind(this, dayKey) }
              onFocus={ this._onDayFocus.bind(this, dayKey) }
              onBlur={ this._onDayBlur.bind(this, dayKey) }
              aria-current={ ariaCurrent }
              aria-selected={ ariaSelected }
              style={ dayStyle }
              className={ unionClassNames(this.props.dayClassName, this.pseudoStyleIds.dayStyleId) }
              role="gridcell">
              { this.props.renderDay ? this.props.renderDay(currentDate) : day }
            </span>) : (<span key={ 'day-' + index }
              style={ dayStyle }
              className={ unionClassNames(this.props.dayClassName, this.pseudoStyleIds.dayStyleId) }
              role="gridcell">
              { this.props.showOtherMonthDate ? (this.props.renderDay ? this.props.renderDay(currentDate) : day) : ''}
            </span>);
  }

  /**
   * Function will render:
   * - main calendar component
   * - call methods to render navBar and week header
   * - get array of weeks in a month and for each day in the week call method to render day
   *
   * It will apply styles sequentially according to following rules:
   * Wrapper:
   * 1. If component is readOnly apply readOnlyWrapperStyle
   * 2. If component is disabled apply disabledWrapperStyle
   *    - If disabled component is hovered apply disabledHoverWrapperStyle
   * 3. If component is not disabled:
   *    - If component is hivered apply hover style
   *    - If component is hovered and active apply hover + active styles
   *    - If component is hovered and focused but not active and preventFocusStyleForTouchAndClick is true apply focusStyles
   * Week:
   * 1. If component is readOnly apply readOnlyWrapperStyle
   * 2. If component is disabled apply disabledWrapperStyle
   */
  render() {
    let wrapperStyle = extend({}, style.wrapperStyle, this.props.wrapperStyle);
    let weekStyle = extend({}, style.weekStyle, this.props.weekStyle);
    if (this.props.readOnly) {
      wrapperStyle = extend(wrapperStyle, style.readOnlyWrapperStyle, this.props.readOnlyWrapperStyle);
      weekStyle = extend(weekStyle, style.weekStyle, this.props.weekStyle);
    }
    if (this.props.disabled) {
      wrapperStyle = extend(wrapperStyle, style.disabledWrapperStyle, this.props.disabledWrapperStyle);
      weekStyle = extend(weekStyle, style.weekStyle, this.props.weekStyle);
      if (this.state.isWrapperHovered) {
        wrapperStyle = extend(wrapperStyle, style.disabledHoverWrapperStyle, this.props.disabledHoverWrapperStyle);
      }
    } else {
      if (this.state.isWrapperHovered) {
        wrapperStyle = extend(wrapperStyle, style.hoverWrapperStyle, this.props.hoverWrapperStyle);
      }
      if (this.state.isWrapperActive) {
        wrapperStyle = extend(wrapperStyle, style.activeWrapperStyle, this.props.activeWrapperStyle);
      } else if (this.preventFocusStyleForTouchAndClick && this.state.isWrapperFocused &&
        !(this.state.isPrevMonthNavFocused || this.state.isNextMonthNavFocused || this.state.focusedDay)) {
        wrapperStyle = extend(wrapperStyle, style.focusWrapperStyle, this.props.focusWrapperStyle);
      }
    }

    const weekArray = getWeekArrayForMonth(this.state.month, this.state.year, this.state.localeData.firstDay);
    const tabIndex = !this.props.disabled ? this.props.tabIndex : false;

    return (
      <div tabIndex={ tabIndex }
           onFocus={ this._onWrapperFocus.bind(this) }
           onBlur={ this._onWrapperBlur.bind(this) }
           onKeyDown={ this._onWrapperKeyDown.bind(this) }
           onMouseDown={ this._onWrapperMouseDown.bind(this) }
           onMouseUp={ this._onWrapperMouseUp.bind(this) }
           onMouseOver={ this._onWrapperMouseOver.bind(this) }
           onMouseOut={ this._onWrapperMouseOut.bind(this) }
           onTouchStart={ this._onWrapperTouchStart.bind(this) }
           onTouchEnd={ this._onWrapperTouchEnd.bind(this) }
           disabled={ this.props.disabled }
           aria-label={ this.props['aria-label'] }
           aria-disabled={ this.props.disabled }
           aria-readonly={ this.props.readOnly }
           style={ wrapperStyle }
           className={ unionClassNames(this.props.wrapperClassName, this.pseudoStyleIds.wrapperStyleId) }>
        { this._getNavBar() }
        <div role="grid">
          { this._getDaysHeader() }
          {
            map(weekArray, (week, weekIndex) => {
              const weekDays = this.state.localeData.isRTL ? reverse(week) : week;
              return (
                <div key={ 'week-' + weekIndex }
                     style={ weekStyle }
                     className= { this.props.weekClassName }>
                  {
                    map(weekDays, (day, dayIndex) => {
                      return this._getDayFragment(day, dayIndex);
                    })
                  }
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }

  /**
   * Function is called when some day if focused and ArrowLeft is pressed.
   * It will set focus to previous day, if it was first day of the month it will decrease month and set focus to last day of previous month.
   */
  _focusPreviousDay(days) {
    const currentFocusedDay = new Date(this.state.focusedDay);
    const currentMonth = currentFocusedDay.getMonth();
    currentFocusedDay.setDate(currentFocusedDay.getDate() - days);
    if (currentFocusedDay.getMonth() === currentMonth) {
      React.findDOMNode(this.refs['day-' + (currentFocusedDay.getMonth() + 1) + '/' + currentFocusedDay.getDate() + '/' + currentFocusedDay.getFullYear()]).focus();
    } else {
      this._decreaseMonth(() => {
        React.findDOMNode(this.refs['day-' + (currentFocusedDay.getMonth() + 1) + '/' + currentFocusedDay.getDate() + '/' + currentFocusedDay.getFullYear()]).focus();
      });
    }
  }

  /**
   * Function is called when some day if focused and ArrowRight is pressed.
   * It will set focus to next day, if it was last day of the month it will increase month and set focus to first day of next month.
   */
  _focusNextDay(days) {
    const currentFocusedDay = new Date(this.state.focusedDay);
    const currentMonth = currentFocusedDay.getMonth();
    currentFocusedDay.setDate(currentFocusedDay.getDate() + days);
    if (currentFocusedDay.getMonth() === currentMonth) {
      React.findDOMNode(this.refs['day-' + (currentFocusedDay.getMonth() + 1) + '/' + currentFocusedDay.getDate() + '/' + currentFocusedDay.getFullYear()]).focus();
    } else {
      this._increaseMonth(() => {
        React.findDOMNode(this.refs['day-' + (currentFocusedDay.getMonth() + 1) + '/' + currentFocusedDay.getDate() + '/' + currentFocusedDay.getFullYear()]).focus();
      });
    }
  }

  /**
   * Callback is called when prevMonthNav receives mouse down.
   * If component is not disabled it will decrease the month and set active state for prevMonthNav.
   */
  _onPrevMonthNavMouseDown(event) {
    if (event.button === 0 && !this.props.disabled) {
      this._decreaseMonth();
      this.setState({
        isPrevMonthNavActive: true
      });
    }
  }

  /**
   * Callback is called when prevMonthNav receives mouse up.
   * It will reset active state for prevMonthNav.
   */
  _onPrevMonthNavMouseUp(event) {
    if (event.button === 0 && !this.props.disabled) {
      this.setState({
        isPrevMonthNavActive: false
      });
    }
  }

  /**
   * Callback is called when prevMonthNav receives touch start.
   * If component is not disabled it will decrease the month and set active state for prevMonthNav.
   */
  _onPrevMonthNavTouchStart(event) {
    if (!this.props.disabled && event.touches.length === 1) {
      this._decreaseMonth();
      this.setState({
        isPrevMonthNavActive: true
      });
    }
  }

  /**
   * Callback is called when prevMonthNav receives touch end.
   * It will reset active state for prevMonthNav.
   */
  _onPrevMonthNavTouchEnd() {
    if (!this.props.disabled) {
      this._decreaseMonth();
      this.setState({
        isPrevMonthNavActive: false
      });
    }
  }

  /**
   * Callback is called when prevMonthNav receives focus.
   * It will set prevMonthNav to focused, if component is not disabled and prevMonthNav is not active.
   */
  _onPrevMonthNavFocus() {
    if (!this.props.disabled && !this.state.isPrevMonthNavActive) {
      this.setState({
        isPrevMonthNavFocused: true
      });
    }
  }

  /**
   * Callback is called when prevMonthNav receives blur.
   * It will reset prevMonthNav focused state.
   */
  _onPrevMonthNavBlur() {
    if (!this.props.disabled) {
      this.setState({
        isPrevMonthNavFocused: false
      });
    }
  }

  /**
   * Callback is called when nextMonthNav receives mouseDown.
   * If component is not disabled it will increase the month and set active state for nextMonthNav.
   */
  _onNextMonthNavMouseDown(event) {
    if (event.button === 0 && !this.props.disabled) {
      this._increaseMonth();
      this.setState({
        isNextMonthNavActive: true
      });
    }
  }

  /**
   * Callback is called when nextMonthNav receives mouse up.
   * It will reset active state for nextMonthNav.
   */
  _onNextMonthNavMouseUp(event) {
    if (event.button === 0 && !this.props.disabled) {
      this.setState({
        isNextMonthNavActive: false
      });
    }
  }

  /**
   * Callback is called when nextMonthNav receives touch start.
   * If component is not disabled it will increase the month and set active state for nextMonthNav.
   */
  _onNextMonthNavTouchStart(event) {
    if (!this.props.disabled && event.touches.length === 1) {
      this._increaseMonth();
      this.setState({
        isNextMonthNavActive: true
      });
    }
  }

  /**
   * Callback is called when nextMonthNav receives touch end.
   * It will reset active state for nextMonthNav.
   */
  _onNextMonthNavTouchEnd() {
    if (!this.props.disabled) {
      this.setState({
        isNextMonthNavActive: false
      });
    }
  }

  /**
   * Callback is called when nextMonthNav receives focus.
   * It will set nextMonthNav to focused, if component is not disabled and nextMonthNav is not active.
   */
  _onNextMonthNavFocus() {
    if (!this.props.disabled && !this.state.isNextMonthNavActive) {
      this.setState({
        isNextMonthNavFocused: true
      });
    }
  }

  /**
   * Callback is called when nextMonthNav receives blur.
   * It will reset nextMonthNav focused state.
   */
  _onNextMonthNavBlur() {
    if (!this.props.disabled) {
      this.setState({
        isNextMonthNavFocused: false
      });
    }
  }

  /**
   * The function will decrease current month in state and call props.onMonthChange.
   * Function takes closure as argument. Right now its used when user uses keys for navigation,
   * we want to decrease month and focus some of its specific date.
   */
  _decreaseMonth(postStateUpdateFunc) {
    let newMonth;
    let newYear;
    if (this.state.month === 0) {
      newMonth = 11;
      newYear = this.state.year - 1;
    } else {
      newMonth = this.state.month - 1;
      newYear = this.state.year;
    }
    this.setState({
      month: newMonth,
      year: newYear
    }, () => {
      if (postStateUpdateFunc) {
        postStateUpdateFunc.call(this);
      }
    });
    if (this.props.onMonthChange) {
      this.props.onMonthChange(newMonth + 1);
    }
  }

  /**
   * The function will increase current month in state and call props.onMonthChange.
   * Function takes closure as argument. Right now its used when user uses keys for navigation,
   * we want to decrease month and focus some of its specific date.
   */
  _increaseMonth(postStateUpdateFunc) {
    let newMonth;
    let newYear;
    if (this.state.month === 11) {
      newMonth = 0;
      newYear = this.state.year + 1;
    } else {
      newMonth = this.state.month + 1;
      newYear = this.state.year;
    }
    this.setState({
      month: newMonth,
      year: newYear
    }, () => {
      if (postStateUpdateFunc) {
        postStateUpdateFunc.call(this);
      }
    });
    if (this.props.onMonthChange) {
      this.props.onMonthChange(newMonth + 1);
    }
  }

  /**
   * Reset the value to undefined.
   *
   * This can be used in case you as developer want to reset the rating manually.
   * This function is not very useful when user uses value/ valueLink,
   * in those cases user can directly update props to undefined and that will be reflected by the component.
   */
  resetValue() {
    this.setState({
      dateValue: undefined
    });
  }
}

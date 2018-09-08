import React, { Ref } from "react";
import prodoce, { produce } from "immer";
import _ from "lodash";
import { cx, css } from "emotion";
import { IArticlesDict } from "model/global";
import { row, center, fullscreen, flex } from "style/layout";

import { getMonthLength } from "util/date";
import { DateTime } from "luxon";
import Space from "kit/space";
import { routePath } from "ctrl/route";
import hsl from "hsl";
import comparisonData from "../comparison"; // {[date:strig]: string}
import specials from "../specials"; // string[]

interface IProps {
  dict: IArticlesDict;
  selected: string;
}

interface IState {}

let years = [2018, 2017, 2016, 2015];

let today = DateTime.local();

let _cachedScroll = 0;

export default class YearView extends React.Component<IProps, IState> {
  refMonths: any;

  constructor(props) {
    super(props);
    this.state = {};

    this.refMonths = React.createRef();
  }

  immerState(f: (s: IState) => void, cb?) {
    this.setState(produce<IState>(f), cb);
  }

  render() {
    return (
      <div className={cx(fullscreen, styleContainer)}>
        <div className={cx(row, styleContent)}>
          {this.renderYears()}
          {this.renderMonths(parseInt(this.props.selected))}
        </div>
      </div>
    );
  }

  renderYears() {
    return (
      <div className={styleYearList}>
        {years.map((year) => {
          return (
            <div
              key={year}
              className={cx(styleYear, this.props.selected === year.toString() ? styleYearSelected : null)}
              onClick={() => {
                routePath(`/year/${year}`);
              }}
            >
              {year}
            </div>
          );
        })}
      </div>
    );
  }

  renderMonths(year: number) {
    let counted = Object.keys(this.props.dict).filter((x) => x.startsWith(year.toString())).length;

    return (
      <div className={cx(flex, styleYearPage)} ref={this.refMonths}>
        <div className={styleYearReview}>{`${counted} posts in this year`}</div>
        <div className={cx(styleMonthTable)}>
          {_.sortBy(_.range(1, 13), (x) => -x).map((m) => {
            let monthFirstDay = DateTime.local(year, m, 1);
            let leftPaddingDays = monthFirstDay.weekday - 1;

            if (monthFirstDay > today) {
              return null;
            }

            return (
              <div key={m} className={styleMonthCalendar}>
                <div className={styleMonthName}>{monthFirstDay.toFormat("MMM")}</div>
                <Space height={8} />
                {this.renderDays(year, m, leftPaddingDays)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  renderDays(year, month, leftPaddingDays) {
    let days = getMonthLength(year, month);

    return (
      <div className={cx(styleWeekRow)}>
        {this.renderWeekNames()}

        {_.range(leftPaddingDays).map((x) => {
          return <div key={x - 10} className={styleDayCell} />;
        })}
        {_.range(1, days + 1).map((d) => {
          let thisDay = DateTime.local(year, month, d);
          let dayInString = thisDay.toFormat("yyyy-MM-dd");
          let hasArticle = this.props.dict[dayInString] != null;

          let aDayString = thisDay.minus({ years: 5 }).toFormat("yyyy-MM-dd");
          let hasComparison = comparisonData.includes(aDayString);

          let isSpecial = specials.includes(thisDay.toFormat("MM-dd"));

          return (
            <div
              className={cx(center, styleDayCell, hasArticle ? styleHasArticle : null, isSpecial ? styleSpecial : null)}
              key={d}
              onClick={() => {
                if (hasArticle) {
                  routePath(`/article/${dayInString}`);
                }
              }}
            >
              {d}
              {hasComparison ? <div className={styleComparison} /> : null}
            </div>
          );
        })}
      </div>
    );
  }

  renderWeekNames() {
    return (
      <>
        <div className={cx(center, styleDayCell, styleHeaderCell)}>Mo</div>
        <div className={cx(center, styleDayCell, styleHeaderCell)}>Tu</div>
        <div className={cx(center, styleDayCell, styleHeaderCell)}>We</div>
        <div className={cx(center, styleDayCell, styleHeaderCell)}>Th</div>
        <div className={cx(center, styleDayCell, styleHeaderCell)}>Fr</div>
        <div className={cx(center, styleDayCell, styleHeaderCell)}>Sa</div>
        <div className={cx(center, styleDayCell, styleHeaderCell)}>Su</div>
      </>
    );
  }

  componentDidMount() {
    this.refMonths.current.scrollTop = _cachedScroll;
  }

  componentWillUnmount() {
    _cachedScroll = this.refMonths.current.scrollTop;
  }
}

const styleDayCell = css`
  width: 32px;
  line-height: 30px;
  color: #444;
  font-size: 14px;
  color: ${hsl(240, 0, 70)};
  border-radius: 16px;
  position: relative;
`;

const styleWeekRow = css`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;

  width: ${32 * 7}px;
`;

const styleContainer = css`
  font-family: Josefin Sans, Helvetica neue, Arial, sans-serif;
`;

const styleMonthTable = css`
  overflow-y: auto;
`;

const styleMonthCalendar = css`
  margin: 16px;
  display: inline-block;
`;

const styleYearList = css`
  margin: 16px;
`;

const styleYear = css`
  line-height: 32px;
  padding: 0 16px;
  color: #ccc;
  cursor: pointer;
  font-size: 20px;
  font-weight: 300;
`;

const styleYearSelected = css`
  color: black;
`;

const styleMonthName = css`
  color: #aaa;
  font-size: 20px;
  font-weight: 300;
`;

const styleHeaderCell = css`
  color: ${hsl(0, 0, 90)};
`;

const styleHasArticle = css`
  background-color: hsl(10, 80%, 80%);

  color: white;
  cursor: pointer;
`;

const styleContent = css`
  /* max-width: 1200px; */
  height: 100%;
  margin: 0 auto;
`;

const styleYearPage = css`
  padding: 24px 0 200px 0;
`;

const styleYearReview = css`
  padding: 0 16px;
  font-size: 20px;
  font-weight: 300;
  color: #aaa;
  margin-bottom: 40px;
`;

let dotSize = 4;

const styleComparison = css`
  width: ${dotSize}px;
  height: ${dotSize}px;
  border-radius: ${dotSize / 2}px;
  background-color: ${hsl(200, 90, 70, 0.6)};
  right: 4px;
  bottom: 8px;
  position: absolute;
`;

const styleSpecial = css`
  cursor: wait;
`;

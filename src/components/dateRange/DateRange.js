import React from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';
import Styles from './DateRange.less';

class DateRange extends React.Component {
	state = {
		startValue: moment().subtract(1, 'months'),
		endValue: moment(),
	};

	componentDidMount = () => {
		this.props.onRef(this);
		this.props.onChange(this.state)
	};

	/*重置查询条件*/
	resetDate = () => {
		const that = this;
		this.setState({
			startValue: moment().subtract(1, 'months'),
			endValue: moment(),
		},function() {
			this.props.onChange(that.state);
		});
	};

	disabledStartDate = (startValue) => {
		const endValue = this.state.endValue;
		if (!startValue || !endValue) {
			return false;
		}
		return startValue.valueOf() > moment().valueOf();
		//return startValue.valueOf() < moment(endValue).subtract(6, 'months').valueOf() || startValue.valueOf() > endValue.valueOf();
	};

	disabledEndDate = (endValue) => {
		const startValue = this.state.startValue;
		if (!endValue || !startValue) {
			return false;
		}
		if(moment(startValue).subtract(-6, 'months') > moment()){
			return endValue.valueOf() < startValue.valueOf() || endValue.valueOf() > moment().valueOf();
		}
		return endValue.valueOf() <= startValue.valueOf() || endValue.valueOf() > moment(startValue).subtract(-6, 'months').valueOf();
	};

	onChange = (field, value) => {
		this.setState({
			[field]: value,
		}, () => {
			this.props.onChange(this.state);
		});
	};

	onStartChange = (value) => {
		this.onChange('startValue', value);
	};

	onEndChange = (value) => {
		this.onChange('endValue', value);
	};

	handleStartOpenChange = (open) => {
		if (!open) {
			this.setState({ endOpen: true });
		}
	};

	handleEndOpenChange = (open) => {
		this.setState({ endOpen: open });
	};

	render() {
		let { startValue, endValue, endOpen } = this.state;

		return (
			<span>
                <DatePicker className={Styles.datePicker}
							disabledDate={this.disabledStartDate}
							value={startValue}
							onChange={this.onStartChange}
							onOpenChange={this.handleStartOpenChange}
							allowClear={false}
							suffixIcon/>~
				<DatePicker className={Styles.datePicker}
							disabledDate={this.disabledEndDate}
							value={endValue}
							onChange={this.onEndChange}
							open={endOpen}
							onOpenChange={this.handleEndOpenChange}
							allowClear={false}
							suffixIcon/>
            </span>
		);
	}
}

export default DateRange;
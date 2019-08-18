import React from 'react';
import { Button, Modal, Table, Input, InputNumber, Tooltip, message } from 'antd';
import styles from './index.less';
import { add, sub, mul, division } from '../../../utils/jsArithmetic';
import _ from 'lodash';

/*
填写实提
*/
class ShiTiModal extends React.Component {
    constructor(props) {
        super(props);
        const { shiTiProps } = props;
        const { orderCode } = shiTiProps ? shiTiProps : {};
        this.state = {
            visible: false,
            orderCode,
            shiTiProps: shiTiProps ? shiTiProps : {},//提货函主体信息
            deliveryOrderItems: [],//提货函明细列表
        };
    };

    /*展示模态框*/
    showModal = () => {
        const { shiTiProps } = this.state;
        const { deliveryOrderItems } = shiTiProps;
        let deliveryOrderItemsTemp = deliveryOrderItems ? _.cloneDeep(deliveryOrderItems) : [];
        if (deliveryOrderItemsTemp && deliveryOrderItemsTemp.length > 0) {
            deliveryOrderItemsTemp.map((item) => {
                item.actualQuantity = item.preQuantity;
                item.actualWeight = item.preWeight;
            });
        }
        this.setState({
            visible: true,
            deliveryOrderItems: deliveryOrderItemsTemp,
        });
    };

    /*关闭模态框*/
    handleCancel = () => {
        this.setState({
            visible: false,
        });
    };

    /*校验预提和实提数量大小*/
    handleOk = (dataSource) => {
        const that = this;
        if (dataSource && dataSource.length > 0) {
            const sum = dataSource[dataSource.length - 1];
            if (sum.actualQuantity === 0 || sum.actualQuantity === '0') {
                message.error('请至少填写一条实提信息')
            } else if (sum.actualQuantity < sum.preQuantity) {
                Modal.confirm({
                    title: (
                        <div>
                            您填写的实提数量少于预提数量：预提数量为<b className={styles.red}> {sum.preQuantity} </b>件，实提数量为<b
                            className={styles.red}> {sum.actualQuantity} </b>件，请确认
                        </div>
                    ),
                    centered: true,
                    onOk() {
                        that.handleSubmit();
                    },
                    okText: '确认',
                });
            } else {
                that.handleSubmit();
            }
        }
    };

    /*提交*/
    handleSubmit = () => {
        const { orderCode, shiTiProps, deliveryOrderItems, diffProps } = this.state;
        const { billOfLadingCode, billOfLadingId } = shiTiProps;
        let dataWrong = false;
        let itemListTemp = [];
        if (deliveryOrderItems.length > 0) {
            deliveryOrderItems.map((item) => {//实提数量必填，可为0，但不能全部为0；当实提数量大于0，实提重量必填
                if ((item.actualQuantity === '') || (item.actualQuantity != '0' && (!item.actualWeight || item.actualWeight == 0))) {
                    dataWrong = true;
                } else {
                    let objTemp = {};
                    objTemp.billOfLadingItemId = item.billOfLadingItemId;
                    objTemp.actualQuantity = item.actualQuantity;
                    objTemp.actualWeight = item.actualWeight;
                    itemListTemp.push(objTemp);
                }
            });
        }
        if (!dataWrong) {
            /*dispatch({

            })*/
            this.setState({
                visible: false,
            }, function () {

            })

        } else {
            message.error('请按要求填写');
        }
    };


    /*存实提数量输入内容*/
    changeQuantityInput(oldValue, item, index, e) {
        const newValue = e.target.value;
        let deliveryOrderItems = _.cloneDeep(this.state.deliveryOrderItems);
        deliveryOrderItems[index].actualQuantity = newValue;
        if (deliveryOrderItems[index]['actualQuantity'] === '0' || deliveryOrderItems[index]['actualQuantity'] === 0) {
            deliveryOrderItems[index].actualWeight = 0;
        }
        if (deliveryOrderItems[index]['calcModeName'] === '抄码' || deliveryOrderItems[index]['calcModeName'] === '理计') {
            if (deliveryOrderItems[index]['preQuantity'] == newValue) {//当实提数量等于预提数量时，将实提重量直接置为预提重量
                deliveryOrderItems[index].actualWeight = deliveryOrderItems[index]['preWeight'];
            } else {//通过实提数量乘以单重得出实提重量
                deliveryOrderItems[index].actualWeight = mul(newValue ? newValue : 0, deliveryOrderItems[index]['pieceWeight'] ? deliveryOrderItems[index]['pieceWeight'] : 0);
            }
        }
        this.setState({
            //deliveryOrderItems: [...deliveryOrderItems],
            deliveryOrderItems,
        });
    };

    /*存实提重量输入内容*/
    changeWeightInput(oldValue, item, index, e) {
        const newValue = e;
        let deliveryOrderItems = _.cloneDeep(this.state.deliveryOrderItems);
        deliveryOrderItems[index].actualWeight = newValue;
        this.setState({
            deliveryOrderItems,
        });
    };

    render() {
        let { deliveryOrderItems, shiTiProps } = this.state;
        /*计算合计数据---start*/
        let dataSource = [];
        if (deliveryOrderItems && deliveryOrderItems.length > 0) {
            let preQuantity = 0;
            let preWeight = 0;
            let actualQuantity = 0;
            let actualWeight = 0;
            deliveryOrderItems.forEach((item) => {
                preQuantity = add(item.preQuantity ? item.preQuantity : 0, preQuantity);
                preWeight = add(item.preWeight ? item.preWeight : 0, preWeight);
                actualQuantity = add(item.actualQuantity ? item.actualQuantity : 0, actualQuantity);
                actualWeight = add(item.actualWeight ? item.actualWeight : 0, actualWeight);
            });
            dataSource = deliveryOrderItems.concat({
                billOfLadingItemId: '合计',
                key: 'sum',
                preQuantity,
                preWeight,
                actualQuantity,
                actualWeight,
            });
        }
        /*计算合计数据---end*/

        /*设置列---start*/
        this.columns = [
            {
                title: '商品',
                dataIndex: 'productProp',
                render: (text, row, index) => {
                    if (index < deliveryOrderItems.length) {
                        return text;
                    }
                    return {
                        children: <span style={{ fontWeight: 600 }}>合计</span>,
                    };
                },
            },
            {
                title: '计量方式',
                dataIndex: 'calcModeName',
            },
            {
                title: '预提数量',
                dataIndex: 'preQuantity',
                render: (text, row, index) => {
                    if (index < deliveryOrderItems.length) {
                        return text;
                    }
                    return {
                        children: <span className="blue">{text}</span>,
                    };
                },
            },
            {
                title: '单重',
                dataIndex: 'pieceWeight',
            },
            {
                title: '单价（元/吨）',
                dataIndex: 'piecePrice',
                render: (text, row, index) => {
                    if (index < deliveryOrderItems.length) {
                        if (text) {
                            return <span className="blue">￥{text}</span>;
                        } else {
                            return '';
                        }
                    }
                },
            },
            {
                title: '预提重量',
                dataIndex: 'preWeight',
                render: (text, row, index) => {
                    if (index < deliveryOrderItems.length) {
                        return text;
                    }
                    return {
                        children: <span className="blue">{text}</span>,
                    };
                },
            },
            {
                title: '实提数量',
                dataIndex: 'actualQuantity',
                width: 150,
                render: (text, row, index) => {
                    if (index < deliveryOrderItems.length) {
                        let toolTipVisible = row.actualQuantity === '';
                        return (
                            <Tooltip
                                placement='right'
                                title='请填入实提数量'
                                visible={toolTipVisible}
                            >
                                <InputNumber
                                    defaultValue={text}
                                    min={0}
                                    max={row.preQuantity}
                                    precision={0}
                                    onBlur={e => this.changeQuantityInput(text, row, index, e)}
                                />
                            </Tooltip>
                        );
                    }
                    return {
                        children: <span className="blue">{text}</span>,
                    };
                },
            },
            {
                title: '实提重量',
                dataIndex: 'actualWeight',
                width: 150,
                render: (text, row, index) => {
                    if (index < deliveryOrderItems.length) {
                        if (row.actualQuantity === 0 || row.actualQuantity === '0') {
                            return <InputNumber value={0} disabled={true}/>;
                        } else {
                            let toolTipVisible = row.actualQuantity && (!row.actualWeight || row.actualWeight == 0);
                            return (
                                <Tooltip
                                    placement='right'
                                    title='请填入实提重量'
                                    visible={toolTipVisible}
                                >
                                    <InputNumber
                                        defaultValue={text}
                                        value={row.actualWeight}
                                        min={0}
                                        precision={3}
                                        onChange={e => this.changeWeightInput(text, row, index, e)}
                                    />
                                </Tooltip>
                            );
                        }
                    }
                    return {
                        children: <span className="blue">{text}</span>,
                    };
                },
            },
        ];
        /*设置列---end*/
        return (
            <div>
                <Button type="primary" onClick={this.showModal}>填写实提</Button>
                <Modal
                    centered
                    width={1080}
                    visible={this.state.visible}
                    title="填写实提"
                    onCancel={this.handleCancel}
                    footer={[
                        <Button key='ok' type='primary' onClick={() => {
                            this.handleOk(dataSource)
                        }}>确认</Button>,
                        <Button key='back' onClick={this.handleCancel}>取消</Button>
                    ]}
                    destroyOnClose={true}//关闭时销毁 Modal 里的子元素
                >
                    <div style={{
                        height: 380,
                        overflow: 'auto'
                    }}>
                        <Table
                            title={() => (
                                <div>
                                    <div className="shiTiTitleInner">
                                        <span>提货函编号：{shiTiProps.billOfLadingCode}</span>
                                        <span>创建时间：{shiTiProps.createDate ? new Date(shiTiProps.createDate).format('yyyy-MM-dd HH:mm:ss') : ''}</span>
                                        <span>提货凭证：{shiTiProps.deliveryCertificate}</span>
                                    </div>
                                    <div className="shiTiTitleInner">
                                        <span>仓库名称：{shiTiProps.warehouse}</span>
                                        <span>联系人：{shiTiProps.traderName} &nbsp;{shiTiProps.traderMobile}</span>
                                    </div>
                                </div>
                            )}
                            className="shiTiModal"
                            rowKey="billOfLadingItemId"
                            columns={this.columns}
                            dataSource={dataSource}
                            pagination={false}
                        />
                    </div>
                </Modal>
            </div>
        );
    }
}

export { ShiTiModal };

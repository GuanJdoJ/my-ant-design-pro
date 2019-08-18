import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import styles from './index.less';
import _ from 'lodash';
import {
    Form,
    Row, Col,
    Input,
    Button,
    Table,
    DatePicker,
    Pagination,
    Modal,
    message,
    Icon,
    Tooltip,
} from 'antd';
import StateTab from '../../../components/Tab';
import DateRange from '../../../components/dateRange/DateRange';
import { ShiTiModal } from './_Modal';

const FormItem = Form.Item;

class ConditionsForm extends React.Component {

    /*查询按钮点击事件*/
    handleSearch = (e) => {
        e.preventDefault();
        const { form } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) {
                return;
            }
            console.log(fieldsValue, '---查询条件')
        });
    };

    /*重置按钮点击事件*/
    handleFormReset = () => {
        const { form } = this.props;
        form.resetFields();
        this.child.resetDate();
    };

    /*为操作DateRange组件实例提供句柄*/
    onRef = (ref) => {
        this.child = ref;
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form onSubmit={this.handleSearch} layout="inline" className="searchForm">
                <Row>
                    <Col md={6}>
                        <FormItem label="提货凭证">{getFieldDecorator('deliveryCertificate')(
                            <Input/>)}</FormItem>
                    </Col>
                    <Col md={6}>
                        <FormItem label="提货时间">{getFieldDecorator('takeDate')(<DateRange
                            onRef={this.onRef}/>)}</FormItem>
                    </Col>
                    <Col md={6}>
                        <FormItem label="提货编号">{getFieldDecorator('billOfLadingCode')(
                            <Input/>)}</FormItem>
                    </Col>
                    <Col md={6}>
                        <FormItem label="订单编号" labelCol={{ span: 3 }}>
                            {getFieldDecorator('orderCode')(<Input/>)}
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <FormItem label="品名">{getFieldDecorator('category')(<Input/>)}</FormItem>
                    </Col>
                    <Col md={6}>
                        <FormItem label="仓库">{getFieldDecorator('warehouse')(<Input/>)}</FormItem>
                    </Col>
                    <Col md={6}>
                        <FormItem label="钢厂">{getFieldDecorator('factory')(<Input/>)}</FormItem>
                    </Col>
                    <Col md={6}>
                        <FormItem label="材质">{getFieldDecorator('material')(<Input/>)}</FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <FormItem label="规格">{getFieldDecorator('specification')(
                            <Input/>)}</FormItem>
                    </Col>
                </Row>
                <div className="searchFormBtn">
                    <div className={styles.searchFormBtnMore}>
                        <Button type="primary" htmlType="submit">查询</Button>
                        <Button htmlType="button" onClick={this.handleFormReset}>清空</Button>
                    </div>
                </div>
            </Form>
        );
    }
}

const WrappedConditionsForm = Form.create()(ConditionsForm);

class ListItems extends React.Component {
    constructor(props) {
        super(props);

        const { listAll, list } = props;
        this.state = {
            pageIndex: 1,//当前页
            pageSize: 2,//单页条数
            totalCount: 5,//总条数
            listAll,
            list,
        };
    }

    /*点击展开折叠图标事件---start*/
    _changeFolding = (showOne, index) => {
        const { list } = this.state;
        if (list && list.length > 0) {
            let listTemp = _.cloneDeep(list);
            let listItemTemp = list[index].deliveryOrderItems;

            if (listItemTemp && listItemTemp.length > 0) {
                listTemp[index].itemsForShow = !!showOne ? listItemTemp : [listItemTemp[0]];
            }

            listTemp[index].showOne = !showOne;
            this.setState({
                list: listTemp,
            });
        }
    };
    /*点击展开折叠图标事件---end*/

    onPageChange = (page, pageSize) => {
        /*dispatch({

        });*/
        const { listAll } = this.state;
        this.setState({
            pageIndex: page,
            list: listAll.slice(pageSize * (page - 1), pageSize * page),
        })
    };

    render() {
        const columns = [
            {
                title: '商品',
                dataIndex: 'productProp',
            },
            {
                title: '计量方式',
                dataIndex: 'calcModeName',
            },
            {
                title: '预提数量',
                dataIndex: 'preQuantity',
            },
            {
                title: '预提重量',
                dataIndex: 'preWeight',
            },
            {
                title: '单价（元/吨）',
                dataIndex: 'piecePrice',
            },
            {
                title: '实提数量',
                dataIndex: 'actualQuantity',
            },
            {
                title: '实提重量',
                dataIndex: 'actualWeight',
            }
        ];
        let { pageIndex, totalCount, pageSize, list = [] } = this.state;

        return (
            <div>
                {
                    list.map((item, index) => {
                        return (
                            <div className={styles.childtableTbody} key={item.billOfLadingId}>
                                <div className={styles.childtableTbodyTop}>
                                    <div className={styles.fl}>
                                        {
                                            item.deliveryOrderItems && item.deliveryOrderItems.length > 1 ?
                                                <a onClick={() => this._changeFolding(item.showOne, index)}>
                                                    <Icon
                                                        type={item.showOne ? 'down-circle' : 'up-circle'}
                                                        theme="filled" style={{ fontSize: 22 }}/>
                                                </a>
                                                :
                                                <Tooltip placement="topLeft" title="该提货函只有一条明细">
                                                    <Icon type="up-circle" theme="filled" style={{
                                                        fontSize: 22,
                                                        color: '#AABDFF',
                                                    }}/>
                                                </Tooltip>
                                        }
                                    </div>

                                    <div className={` ${styles.fm}`}>
                                        <div className={styles.topInner}>
                                            <div><b>{item.warehouse}</b></div>
                                            <div>订单编号：<a>{item.orderCode}</a></div>
                                            <div>提货函编号：{item.billOfLadingCode}</div>
                                            <div>提货方式：{item.deliveryWay}</div>

                                        </div>
                                        <div className={styles.topInner}>
                                            <div>买家：{item.buyerName}</div>
                                            <div>联系人：{item.traderName} &nbsp;{item.traderMobile}</div>
                                            <div>提货凭证：{item.deliveryCertificate} </div>
                                            <div>备注：{item.remark}</div>
                                        </div>
                                    </div>
                                    <div className={styles.fr}>
                                        <div className={styles.deliveryStatus}>
                                            <span
                                                className={styles.blue}>{item.deliveryStatusName}</span>
                                        </div>
                                        <div>下单时间：{new Date(item.createDate).format('yyyy-MM-dd hh:mm:ss')}</div>
                                    </div>

                                </div>
                                <div className={styles.childtableTbodyMiddle}>
                                    <Table rowKey="billOfLadingItemId"
                                           dataSource={item.itemsForShow} columns={columns}
                                           pagination={false}/>
                                </div>
                                <div className={styles.childtableTbodyBottom}>
                                    <div className={styles.totalName}><b>总计：</b></div>
                                    <div className={styles.sumItemWrap}>
                                        <span>预提数量：{item.preQuantity} 件</span>
                                        <span>预提数量：{item.preWeight} 吨</span>
                                        <span>实提数量：{item.actualQuantity} 件</span>
                                        <span>实提重量：{item.actualWeight} 吨</span>
                                    </div>

                                    <div className={styles.fr}>
                                        <ShiTiModal shiTiProps={item}/>
                                        <div className={styles.marginFew}>
                                            <Button type="primary">按钮样式</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )

                    })
                }

                <Pagination defaultCurrent={1} total={totalCount} showQuickJumper
                            className={styles.page} onChange={this.onPageChange} current={pageIndex}
                            pageSize={pageSize}/>
            </div>
        )
    }
}

class takeListForm extends React.Component {
    state = {
        orderState: '0',//订单状态
    };
    /*切换tab执行查询*/
    handleTagChange = (orderState) => {
        /*dispatch({

        });*/
        this.setState({
            orderState,
        })
    };

    render() {
        const { orderState } = this.state;

        const listProps = {
            listAll: [
                {
                    'billOfLadingId': 1,
                    'billOfLadingCode': 'TH12345678-04',
                    'createDate': 1562046700000,
                    'deliveryCertificate': '鄂A12345',
                    'deliveryWay': '提货',
                    'remark': null,
                    'preQuantity': 10,
                    'preWeight': 1000,
                    'actualQuantity': 7,
                    'actualWeight': 500,
                    'buyerName': '武汉科技公司',
                    'traderName': '张三',
                    'traderMobile': null,
                    'orderCode': 'CG1907021033001',
                    'deliveryStatusName': '提货完成',
                    'deliveryStatus': 0,
                    'warehouse': '武汉仓库',
                    'showOne': true,
                    'itemsForShow': [
                        {
                            'billOfLadingItemId': 1063571122,
                            'category': '四切普板',
                            'material': 'HRB335',
                            'specification': '8*1500*5000',
                            'factory': '宝钢',
                            'packageNo': null,
                            'productProp': '四切普板 HRB335 8*1500*5000 宝钢',
                            'preQuantity': 10,
                            'preWeight': 1000,
                            'actualQuantity': 8,
                            'actualWeight': 600,
                            'calcModeName': '过磅',
                            'piecePrice': 2300,
                            'pieceWeight': null
                        }
                    ],
                    'deliveryOrderItems': [
                        {
                            'billOfLadingItemId': 1063571234,
                            'category': '四切普板',
                            'material': 'HRB335',
                            'specification': '8*1500*5000',
                            'factory': '宝钢',
                            'packageNo': null,
                            'productProp': '四切普板 HRB335 8*1500*5000 宝钢',
                            'preQuantity': 20,
                            'preWeight': 2000,
                            'actualQuantity': 20,
                            'actualWeight': 1200,
                            'calcModeName': '过磅',
                            'piecePrice': 2300,
                            'pieceWeight': null
                        },
                        {
                            'billOfLadingItemId': 10635713,
                            'category': '四切普板',
                            'material': 'HRB335',
                            'specification': '8*1500*5000',
                            'factory': '宝钢',
                            'packageNo': null,
                            'productProp': '四切普板 HRB335 8*1500*5000 宝钢',
                            'preQuantity': 1,
                            'preWeight': 0.471,
                            'actualQuantity': 1,
                            'actualWeight': 0.5,
                            'calcModeName': '过磅',
                            'piecePrice': 2300,
                            'pieceWeight': null
                        }
                    ]
                },
                {
                    'billOfLadingId': 2,
                    'billOfLadingCode': 'TH123456789-03',
                    'createDate': 1562046687000,
                    'deliveryCertificate': '自提',
                    'deliveryWay': '提货',
                    'remark': null,
                    'preQuantity': 1,
                    'preWeight': 0.471,
                    'actualQuantity': 1,
                    'actualWeight': 0.4,
                    'buyerName': '上海科技公司',
                    'traderName': '李四',
                    'traderMobile': null,
                    'orderCode': 'CG1907021033002',
                    'deliveryStatusName': '提货完成',
                    'deliveryStatus': 0,
                    'warehouse': '无锡库',
                    'showOne': true,
                    'itemsForShow': [
                        {
                            'billOfLadingItemId': 1063571221,
                            'category': '四切普板',
                            'material': 'HRB335',
                            'specification': '8*1500*5000',
                            'factory': '宝钢',
                            'packageNo': null,
                            'productProp': '四切普板 HRB335 8*1500*5000 宝钢',
                            'preQuantity': 1,
                            'preWeight': 0.471,
                            'actualQuantity': 1,
                            'actualWeight': 0.4,
                            'calcModeName': '过磅',
                            'piecePrice': 2300,
                            'pieceWeight': null
                        }
                    ],
                    'deliveryOrderItems': [
                        {
                            'billOfLadingItemId': 1063571133,
                            'category': '四切普板',
                            'material': 'HRB335',
                            'specification': '8*1500*5000',
                            'factory': '宝钢',
                            'packageNo': null,
                            'productProp': '四切普板 HRB335 8*1500*5000 宝钢',
                            'preQuantity': 1,
                            'preWeight': 0.471,
                            'actualQuantity': 1,
                            'actualWeight': 0.4,
                            'calcModeName': '过磅',
                            'piecePrice': 2300,
                            'pieceWeight': null
                        }
                    ]
                },
                {
                    'billOfLadingId': 3,
                    'billOfLadingCode': 'TH12345678-05',
                    'createDate': 1562046700000,
                    'deliveryCertificate': '鄂A12345',
                    'deliveryWay': '提货',
                    'remark': null,
                    'preQuantity': 1,
                    'preWeight': 0.471,
                    'actualQuantity': 1,
                    'actualWeight': 0.5,
                    'buyerName': '武汉科技公司',
                    'traderName': '张三',
                    'traderMobile': null,
                    'orderCode': 'CG1907021033003',
                    'deliveryStatusName': '提货完成',
                    'deliveryStatus': 0,
                    'warehouse': '武汉仓库',
                    'showOne': true,
                    'itemsForShow': [
                        {
                            'billOfLadingItemId': 106357112,
                            'category': '四切普板',
                            'material': 'HRB335',
                            'specification': '8*1500*5000',
                            'factory': '宝钢',
                            'packageNo': null,
                            'productProp': '四切普板 HRB335 8*1500*5000 宝钢',
                            'preQuantity': 1,
                            'preWeight': 0.471,
                            'actualQuantity': 1,
                            'actualWeight': 0.5,
                            'calcModeName': '过磅',
                            'piecePrice': 2300,
                            'pieceWeight': null
                        }
                    ],
                    'deliveryOrderItems': [
                        {
                            'billOfLadingItemId': 106357122,
                            'category': '四切普板',
                            'material': 'HRB335',
                            'specification': '8*1500*5000',
                            'factory': '宝钢',
                            'packageNo': null,
                            'productProp': '四切普板 HRB335 8*1500*5000 宝钢',
                            'preQuantity': 1,
                            'preWeight': 0.471,
                            'actualQuantity': 1,
                            'actualWeight': 0.5,
                            'calcModeName': '过磅',
                            'piecePrice': 2300,
                            'pieceWeight': null
                        },
                        {
                            'billOfLadingItemId': 106357133,
                            'category': '四切普板',
                            'material': 'HRB335',
                            'specification': '8*1500*5000',
                            'factory': '宝钢',
                            'packageNo': null,
                            'productProp': '四切普板 HRB335 8*1500*5000 宝钢',
                            'preQuantity': 1,
                            'preWeight': 0.471,
                            'actualQuantity': 1,
                            'actualWeight': 0.5,
                            'calcModeName': '过磅',
                            'piecePrice': 2300,
                            'pieceWeight': null
                        }
                    ]
                },
                {
                    'billOfLadingId': 4,
                    'billOfLadingCode': 'TH12345678-06',
                    'createDate': 1562046700000,
                    'deliveryCertificate': '鄂A12345',
                    'deliveryWay': '提货',
                    'remark': null,
                    'preQuantity': 1,
                    'preWeight': 0.471,
                    'actualQuantity': 1,
                    'actualWeight': 0.5,
                    'buyerName': '武汉科技公司',
                    'traderName': '张三',
                    'traderMobile': null,
                    'orderCode': 'CG1907021033004',
                    'deliveryStatusName': '提货完成',
                    'deliveryStatus': 0,
                    'warehouse': '武汉仓库',
                    'showOne': true,
                    'itemsForShow': [
                        {
                            'billOfLadingItemId': 106357124,
                            'category': '四切普板',
                            'material': 'HRB335',
                            'specification': '8*1500*5000',
                            'factory': '宝钢',
                            'packageNo': null,
                            'productProp': '四切普板 HRB335 8*1500*5000 宝钢',
                            'preQuantity': 1,
                            'preWeight': 0.471,
                            'actualQuantity': 1,
                            'actualWeight': 0.5,
                            'calcModeName': '过磅',
                            'piecePrice': 2300,
                            'pieceWeight': null
                        }
                    ],
                    'deliveryOrderItems': [
                        {
                            'billOfLadingItemId': 106357125,
                            'category': '四切普板',
                            'material': 'HRB335',
                            'specification': '8*1500*5000',
                            'factory': '宝钢',
                            'packageNo': null,
                            'productProp': '四切普板 HRB335 8*1500*5000 宝钢',
                            'preQuantity': 1,
                            'preWeight': 0.471,
                            'actualQuantity': 1,
                            'actualWeight': 0.5,
                            'calcModeName': '过磅',
                            'piecePrice': 2300,
                            'pieceWeight': null
                        },
                        {
                            'billOfLadingItemId': 106357163,
                            'category': '四切普板',
                            'material': 'HRB335',
                            'specification': '8*1500*5000',
                            'factory': '宝钢',
                            'packageNo': null,
                            'productProp': '四切普板 HRB335 8*1500*5000 宝钢',
                            'preQuantity': 1,
                            'preWeight': 0.471,
                            'actualQuantity': 1,
                            'actualWeight': 0.5,
                            'calcModeName': '过磅',
                            'piecePrice': 2300,
                            'pieceWeight': null
                        }
                    ]
                },
                {
                    'billOfLadingId': 5,
                    'billOfLadingCode': 'TH12345678-07',
                    'createDate': 1562046700000,
                    'deliveryCertificate': '鄂A12345',
                    'deliveryWay': '提货',
                    'remark': null,
                    'preQuantity': 1,
                    'preWeight': 0.471,
                    'actualQuantity': 1,
                    'actualWeight': 0.5,
                    'buyerName': '武汉科技公司',
                    'traderName': '张三',
                    'traderMobile': null,
                    'orderCode': 'CG19070210333005',
                    'deliveryStatusName': '提货完成',
                    'deliveryStatus': 0,
                    'warehouse': '武汉仓库',
                    'showOne': true,
                    'itemsForShow': [
                        {
                            'billOfLadingItemId': 106357127,
                            'category': '四切普板',
                            'material': 'HRB335',
                            'specification': '8*1500*5000',
                            'factory': '宝钢',
                            'packageNo': null,
                            'productProp': '四切普板 HRB335 8*1500*5000 宝钢',
                            'preQuantity': 1,
                            'preWeight': 0.471,
                            'actualQuantity': 1,
                            'actualWeight': 0.5,
                            'calcModeName': '过磅',
                            'piecePrice': 2300,
                            'pieceWeight': null
                        }
                    ],
                    'deliveryOrderItems': [
                        {
                            'billOfLadingItemId': 106357128,
                            'category': '四切普板',
                            'material': 'HRB335',
                            'specification': '8*1500*5000',
                            'factory': '宝钢',
                            'packageNo': null,
                            'productProp': '四切普板 HRB335 8*1500*5000 宝钢',
                            'preQuantity': 1,
                            'preWeight': 0.471,
                            'actualQuantity': 1,
                            'actualWeight': 0.5,
                            'calcModeName': '过磅',
                            'piecePrice': 2300,
                            'pieceWeight': null
                        },
                        {
                            'billOfLadingItemId': 106357139,
                            'category': '四切普板',
                            'material': 'HRB335',
                            'specification': '8*1500*5000',
                            'factory': '宝钢',
                            'packageNo': null,
                            'productProp': '四切普板 HRB335 8*1500*5000 宝钢',
                            'preQuantity': 1,
                            'preWeight': 0.471,
                            'actualQuantity': 1,
                            'actualWeight': 0.5,
                            'calcModeName': '过磅',
                            'piecePrice': 2300,
                            'pieceWeight': null
                        }
                    ]
                }
            ],
            list: [
                {
                    'billOfLadingId': 1,
                    'billOfLadingCode': 'TH12345678-04',
                    'createDate': 1562046700000,
                    'deliveryCertificate': '鄂A12345',
                    'deliveryWay': '提货',
                    'remark': null,
                    'preQuantity': 10,
                    'preWeight': 1000,
                    'actualQuantity': 7,
                    'actualWeight': 500,
                    'buyerName': '武汉科技公司',
                    'traderName': '张三',
                    'traderMobile': null,
                    'orderCode': 'CG1907021033001',
                    'deliveryStatusName': '提货完成',
                    'deliveryStatus': 0,
                    'warehouse': '武汉仓库',
                    'showOne': true,
                    'itemsForShow': [
                        {
                            'billOfLadingItemId': 1063571122,
                            'category': '四切普板',
                            'material': 'HRB335',
                            'specification': '8*1500*5000',
                            'factory': '宝钢',
                            'packageNo': null,
                            'productProp': '四切普板 HRB335 8*1500*5000 宝钢',
                            'preQuantity': 10,
                            'preWeight': 1000,
                            'actualQuantity': 8,
                            'actualWeight': 600,
                            'calcModeName': '过磅',
                            'piecePrice': 2300,
                            'pieceWeight': null
                        }
                    ],
                    'deliveryOrderItems': [
                        {
                            'billOfLadingItemId': 1063571234,
                            'category': '四切普板',
                            'material': 'HRB335',
                            'specification': '8*1500*5000',
                            'factory': '宝钢',
                            'packageNo': null,
                            'productProp': '四切普板 HRB335 8*1500*5000 宝钢',
                            'preQuantity': 20,
                            'preWeight': 2000,
                            'actualQuantity': 20,
                            'actualWeight': 1200,
                            'calcModeName': '过磅',
                            'piecePrice': 2300,
                            'pieceWeight': null
                        },
                        {
                            'billOfLadingItemId': 10635713,
                            'category': '四切普板',
                            'material': 'HRB335',
                            'specification': '8*1500*5000',
                            'factory': '宝钢',
                            'packageNo': null,
                            'productProp': '四切普板 HRB335 8*1500*5000 宝钢',
                            'preQuantity': 1,
                            'preWeight': 0.471,
                            'actualQuantity': 1,
                            'actualWeight': 0.5,
                            'calcModeName': '过磅',
                            'piecePrice': 2300,
                            'pieceWeight': null
                        }
                    ]
                },
                {
                    'billOfLadingId': 2,
                    'billOfLadingCode': 'TH123456789-03',
                    'createDate': 1562046687000,
                    'deliveryCertificate': '自提',
                    'deliveryWay': '提货',
                    'remark': null,
                    'preQuantity': 1,
                    'preWeight': 0.471,
                    'actualQuantity': 1,
                    'actualWeight': 0.4,
                    'buyerName': '上海科技公司',
                    'traderName': '李四',
                    'traderMobile': null,
                    'orderCode': 'CG1907021033002',
                    'deliveryStatusName': '提货完成',
                    'deliveryStatus': 0,
                    'warehouse': '无锡库',
                    'showOne': true,
                    'itemsForShow': [
                        {
                            'billOfLadingItemId': 1063571221,
                            'category': '四切普板',
                            'material': 'HRB335',
                            'specification': '8*1500*5000',
                            'factory': '宝钢',
                            'packageNo': null,
                            'productProp': '四切普板 HRB335 8*1500*5000 宝钢',
                            'preQuantity': 1,
                            'preWeight': 0.471,
                            'actualQuantity': 1,
                            'actualWeight': 0.4,
                            'calcModeName': '过磅',
                            'piecePrice': 2300,
                            'pieceWeight': null
                        }
                    ],
                    'deliveryOrderItems': [
                        {
                            'billOfLadingItemId': 1063571133,
                            'category': '四切普板',
                            'material': 'HRB335',
                            'specification': '8*1500*5000',
                            'factory': '宝钢',
                            'packageNo': null,
                            'productProp': '四切普板 HRB335 8*1500*5000 宝钢',
                            'preQuantity': 1,
                            'preWeight': 0.471,
                            'actualQuantity': 1,
                            'actualWeight': 0.4,
                            'calcModeName': '过磅',
                            'piecePrice': 2300,
                            'pieceWeight': null
                        }
                    ]
                },
            ]
        };

        const tabProps = {
            orderState,
            tabContent: [
                {
                    num: 0,
                    title: '全部',
                    orderState: '0',
                    content: <ListItems {...listProps}/>,
                },
                {
                    num: 1,
                    title: '待提货',
                    orderState: '1',
                    content: <ListItems {...listProps}/>,
                },
                {
                    num: 2,
                    title: '提货中【填写实提】',
                    orderState: '2',
                    content: <ListItems {...listProps}/>,
                },
                {
                    num: 3,
                    title: '待提货',
                    orderState: '3',
                    content: <ListItems {...listProps}/>,
                },
            ],
            handleTagChange: this.handleTagChange,
        };
        return (
            <PageHeaderWrapper>
                <div className={styles.waitSaleOrder}>
                    <WrappedConditionsForm/>

                    <div style={{ padding: '0 20px', }}>
                        <StateTab {...tabProps}/>
                    </div>
                </div>
            </PageHeaderWrapper>
        )
    }
}

export default takeListForm;

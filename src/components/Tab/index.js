import React from 'react';
import { Tabs } from 'antd';

const TabPane = Tabs.TabPane;

function StateTab(props) {
    const { tabContent, orderState, handleTagChange } = props;

    return (
        <Tabs onChange={handleTagChange} activeKey={orderState?orderState.toString():'0'}>
            {
                tabContent ?
                    tabContent.map((item) => {
                        return (
                            <TabPane tab={<span>{item.title}<b>（{item.num}）</b></span>} key={item.orderState}>
                                {
                                    item.content
                                }
                            </TabPane>
                        );
                    }) : ''
            }
        </Tabs>
    );
}

export default StateTab;

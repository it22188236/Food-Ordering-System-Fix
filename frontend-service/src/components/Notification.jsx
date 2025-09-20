import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Badge, Popover, List, Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';

const Notification = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [visible, setVisible] = useState(false);

  const handleVisibleChange = (visible) => {
    setVisible(visible);
  };

  const content = (
    <div style={{ width: 300 }}>
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #f0f0f0'}}>
        <strong>Notifications</strong>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={notifications.slice(0, 5)}
        renderItem={(item) => (
          <List.Item 
            onClick={() => markAsRead(item._id)}
            style={{ 
              padding: '12px 16px',
              cursor: 'pointer',
              background: !item.read ? '#f6ffed' : 'white'
            }}
          >
            <List.Item.Meta
              title={item.title}
              description={item.message}
            />
          </List.Item>
        )}
      />
      {notifications.length > 5 && (
        <div style={{ textAlign: 'center', padding: '8px' }}>
          <Button type="link" onClick={() => window.location.href = '/notifications'}>
            View All
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      visible={visible}
      onVisibleChange={handleVisibleChange}
      placement="bottomRight"
    >
      <Badge count={unreadCount}>
        <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
      </Badge>
    </Popover>
  );
};

export default Notification;
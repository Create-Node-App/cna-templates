# Ant Design Best Practices

## Quick Start

Ant Design is configured in this project. See the [official documentation](https://ant.design/docs/react/introduce) for complete setup details.

## Essential Patterns

### Theme Configuration
Customize the theme using ConfigProvider:

```tsx
import { ConfigProvider } from 'antd';

const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
  },
};

function App() {
  return (
    <ConfigProvider theme={theme}>
      {/* Your app */}
    </ConfigProvider>
  );
}
```

### Form Handling
Use Ant Design's powerful Form component:

```tsx
import { Form, Input, Button } from 'antd';

function ContactForm() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Form values:', values);
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, type: 'email' }]}
      >
        <Input placeholder="Enter email" />
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
```

### Data Display
Use Table for complex data:

```tsx
import { Table, Tag, Space } from 'antd';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => (
      <Tag color={status === 'active' ? 'green' : 'red'}>
        {status}
      </Tag>
    ),
  },
];

const data = [
  { key: '1', name: 'John', status: 'active' },
];

<Table columns={columns} dataSource={data} />
```

### Loading States
```tsx
import { Button, Spin } from 'antd';

<Button loading={isLoading} type="primary">
  {isLoading ? 'Saving...' : 'Save'}
</Button>

// For entire sections
<Spin spinning={loading}>
  <div>Content here</div>
</Spin>
```

### Notifications
```tsx
import { notification, message } from 'antd';

// Success message
message.success('Operation completed successfully');

// Detailed notification
notification.open({
  message: 'Update Successful',
  description: 'Your profile has been updated.',
});
```

## Layout Patterns

### Responsive Layout
```tsx
import { Layout, Row, Col } from 'antd';
const { Header, Content, Sider } = Layout;

<Layout>
  <Header>Header</Header>
  <Layout>
    <Sider width={200}>Sidebar</Sider>
    <Content>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          Content
        </Col>
      </Row>
    </Content>
  </Layout>
</Layout>
```

## Common Issues

### Icons Not Displaying
Import icons explicitly:
```tsx
// ✅ Good
import { DeleteOutlined } from '@ant-design/icons';

<Button icon={<DeleteOutlined />}>Delete</Button>
```

### Theme Not Applied
Ensure ConfigProvider wraps your app:
```tsx
<ConfigProvider theme={theme}>
  <App />
</ConfigProvider>
```

### Form Validation Issues
Use Form.Item rules properly:
```tsx
<Form.Item
  name="password"
  rules={[
    { required: true, message: 'Please input your password!' },
    { min: 8, message: 'Password must be at least 8 characters!' }
  ]}
>
  <Input.Password />
</Form.Item>
```

## Performance Tips

- Use `rowSelection` for table performance with large datasets
- Implement virtual scrolling for long lists
- Use `Form.List` for dynamic form fields
- Leverage `Spin` for loading states instead of custom loaders

## Resources

- [Ant Design Documentation](https://ant.design/)
- [Component Demos](https://ant.design/components/overview/)
- [Design Language](https://ant.design/docs/spec/introduce)
- [Form Validation](https://ant.design/components/form/#components-form-demo-validate-static) 
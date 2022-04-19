import {useEffect, useRef, useState} from 'react'
import { io } from 'socket.io-client'
import {Typography, Row, Col, Input, Button, Layout, List, Modal, Alert, PageHeader} from 'antd'
import { PlusOutlined } from '@ant-design/icons'

import './App.css';
import 'antd/dist/antd.css';

const { Title, Text } = Typography

const socket = io('ws://localhost:9000')

function TermTracker({ trackedTerm }) {
  const start = useRef(Date.now())
  const [ tweets, setTweets ] = useState([])
  const [count, setCount] = useState(0)
  useEffect(() => {
    socket.emit('track', trackedTerm)
    socket.on(trackedTerm, updateList)
  }, [])
  function updateList(tweet) {
    setCount(previousCount => previousCount + 1)
    setTweets((list) => {
      if (list.length > 40) {
        list.pop()
      }
      return [
        tweet,
        ...list,
      ]
    })
  }
  const minutes = (Date.now() - start.current) / 60000
  const tweetsPerMinutes = count / (minutes > 0 ? minutes : 1)
  return (
    <Layout className="term-tracker-container">
      <List
        className="term-tracker-list"
        header={
          <Title className="term-tracker-title">{trackedTerm}</Title>
        }
        footer={
          <Title className="term-tracker-title">total:&nbsp;{count}&nbsp;TPM:&nbsp;{tweetsPerMinutes.toFixed()}</Title>
        }
        dataSource={tweets}
        bordered
        renderItem={({ id, text }) => (
          <List.Item>
            <Text>{text}</Text>
          </List.Item>
        )}
      />
    </Layout>
  )
}

function MonitorScreen({ trackedTerms, onAddBtnClick }) {
  return (
    <Layout className="monitorscreen-container">
      <Row wrap={false} className="monitorscreen-row">
        {trackedTerms.map((term) => (
          <Col className="monitorscreen-column" flex={1}>
            <TermTracker trackedTerm={term} />
          </Col>
        ))}
        <Col>
          <Button onClick={onAddBtnClick} className="add-button" type="primary" icon={<PlusOutlined/>} />
        </Col>
      </Row>
    </Layout>
  )
}

function BootScreen({ boot }) {
  const [shouldTransitionScreen, setShouldTransitionScreen] = useState(false)
  const [firstKeyword, setFirstKeyword] = useState('');
  const [secondKeyword, setSecondKeyword] = useState('')
  function onClick() {
    setShouldTransitionScreen(true)
    setTimeout(() => {
      boot(firstKeyword, secondKeyword)
    }, 500)
  }
  return (
    <Layout className={`bootscreen-container${shouldTransitionScreen ? ' bootscreen-container-transitioning' : ''}`}>
      <Row justify="center" gutter={24}>
        <Title className="bootscreen-title">Please select two different keywords.</Title>
      </Row>
      <Row align="middle" justify="center" gutter={24}>
        <Col>
          <Input value={firstKeyword} onChange={e => setFirstKeyword(e.target.value)} size="large" />
        </Col>
        <Col>
          <Input value={secondKeyword} onChange={(e) => setSecondKeyword(e.target.value)} size="large" />
        </Col>
      </Row>
      <Row align='middle' justify="center" gutter={24}>
        <Button onClick={onClick} className="proceed-btn" type="primary" disabled={firstKeyword === '' || secondKeyword === ''}>Proceed.</Button>
      </Row>
    </Layout>
  )
}

function App() {
  const [value, setValue] = useState('')
  const [modalShown, setModalShown] = useState(false)
  const [trackedTerms, setTrackedTerms] = useState([])
  function boot(...terms) {
    setTrackedTerms(terms)
  }
  function showModal() {
    setModalShown(true)
  }
  function hideModal() {
    setModalShown(false)
    setValue('')
  }
  function addTerm() {
    if (value !== '') {
      setTrackedTerms(previous => [...previous, value])
    }
    hideModal()
  }
  function reset() {
    window.location.reload()
  }
  return (
    <Layout className="app-container">
      {trackedTerms.length === 0 ? (
        <BootScreen boot={boot}/>
      ) : (
        <Layout>
          <PageHeader
            className="monitorscreen-header"
            ghost={false}
            title="Tweet Compare"
            extra={[
              <Button onClick={reset} type="primary" danger>RESET</Button>
            ]}
          />
          <MonitorScreen onAddBtnClick={showModal} trackedTerms={trackedTerms} />
        </Layout>
      )}
      <Modal title="Add a keyword" visible={modalShown} onOk={addTerm}>
        <Col>
          {/* <Input value={value} onChange={e => setValue(e.target.value)} size="large" /> */ }
          <Alert message="You cannot compare more than two keywords yet." type="error" />
        </Col>
      </Modal>
    </Layout>
  );
}

export default App;

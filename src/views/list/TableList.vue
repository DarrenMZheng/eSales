<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="代码">
                <a-input v-model="queryParam.riskCode" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="名称">
                <a-input v-model="queryParam.riskName" style="width: 100%"/>
              </a-form-item>
            </a-col>
            <template v-if="advanced">
              <a-col :md="8" :sm="24">
                <a-form-item label="使用状态">
                  <a-select v-model="queryParam.status" placeholder="请选择" default-value="0">
                    <a-select-option value="0">全部</a-select-option>
                    <a-select-option value="1">关闭</a-select-option>
                    <a-select-option value="2">运行中</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="更新日期">
                  <a-date-picker v-model="queryParam.date" style="width: 100%" placeholder="请输入更新日期"/>
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="使用状态">
                  <a-select v-model="queryParam.useStatus" placeholder="请选择" default-value="0">
                    <a-select-option value="0">全部</a-select-option>
                    <a-select-option value="1">关闭</a-select-option>
                    <a-select-option value="2">运行中</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="使用状态">
                  <a-select placeholder="请选择" default-value="0">
                    <a-select-option value="0">全部</a-select-option>
                    <a-select-option value="1">关闭</a-select-option>
                    <a-select-option value="2">运行中</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </template>
            <a-col :md="!advanced && 8 || 24" :sm="24">
              <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="queryRisk">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="handleAdd">新建</a-button>
      </div>

      <s-table
        ref="table"
        size="default"
        rowKey="key"
        :columns="columns"
        :data="loadData"
        :alert="true"
        :flag="flag"
        :rowSelection="rowSelection"
        :changePage="changePage"
        showPagination="true"
        :pagination="pagination"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span>
        <span slot="description" slot-scope="text">
          <ellipsis :length="4" tooltip>{{ text }}</ellipsis>
        </span>

        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)">修改</a>
          </template>
        </span>
      </s-table>

      <create-form
        ref="createModal"
        :visible="visible"
        :loading="confirmLoading"
        :model="mdl"
        :title="title"
        @cancel="handleCancel"
        @ok="handleOk"
      />
      <step-by-step-modal ref="modal" @ok="handleOk"/>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import moment from 'moment'
import { STable, Ellipsis } from '@/components'
import { getRoleList, queryRiskList, addRisk, updateRisk } from '@/api/manage'

import StepByStepModal from './modules/StepByStepModal'
import CreateForm from './modules/CreateForm'

let responseDataList = []

const columns = [
  {
    title: '险种ID',
    dataIndex: 'riskId',
    width: '90px'
  },
  {
    title: '代码',
    dataIndex: 'riskCode'
  },
  {
    title: '名称',
    dataIndex: 'riskName'
  },
  {
    title: '主险标志',
    dataIndex: 'mainRiskType',
    width: '90px'
  },
  {
    title: '寿险风险倍数',
    dataIndex: 'lifeInsurRiskMul',
    minWidth: '90px'
  },
  {
    title: '意外险风险倍数',
    dataIndex: 'accidentRiskMul',
    minWidth: '90px'
  },
  {
    title: '重疾风险倍数',
    dataIndex: 'sickInsurRiskMul',
    minWidth: '90px'
  },
  {
    title: '住院津贴',
    dataIndex: 'hospitalizaBenefit',
    minWidth: '90px'
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '100px',
    scopedSlots: { customRender: 'action' }
  }
]

const statusMap = {
  0: {
    status: 'default',
    text: '关闭'
  },
  1: {
    status: 'processing',
    text: '运行中'
  },
  2: {
    status: 'success',
    text: '已上线'
  },
  3: {
    status: 'error',
    text: '异常'
  }
}

// const mockListData = {
//   'code': 200, // 状态码，200：请求成功，其他：请求出错
//   'msg': null, // 错误消息，成功返回 null, 否则返回出错信息
//   'data': [
//     {// 返回请求数据，JSON 数据格式
//       'riskSerialNum': '100011', // 流水号  主键
//       'riskId': 'ID10012', // 险种ID
//       'riskCode': 'MII', // 险种代码
//       'riskName': 'AA', // 险种名称
//       'mainRiskType': 'Y', // 主险标志
//       'lifeInsurRiskMul': '1', // 寿险风险等级
//       'accidentRiskMul': '1', // 意外险风险倍数
//       'sickInsurRiskMul': '2', // 重疾险风险倍数
//       'hospitalizaBenefit': '2' // 住院津贴
//     },
//     { // 返回请求数据，JSON 数据格式
//       'riskSerialNum': '100012', // 流水号  主键
//       'riskId': 'ID10013', // 险种ID
//       'riskCode': 'LTA', // 险种代码
//       'riskName': '尊享优选', // 险种名称
//       'mainRiskType': 'N', // 主险标志
//       'lifeInsurRiskMul': '1', // 寿险风险等级
//       'accidentRiskMul': '2', // 意外险风险倍数
//       'sickInsurRiskMul': '1', // 重疾险风险倍数
//       'hospitalizaBenefit': '2' // 住院津贴
//     }
//   ]
// }

export default {
  name: 'TableList',
  components: {
    STable,
    Ellipsis,
    CreateForm,
    StepByStepModal
  },
  data () {
    this.columns = columns
    return {
      // create model
      visible: false,
      flag: true,
      confirmLoading: false,
      mdl: null,
      title: '新增险种',
      // 高级搜索 展开/关闭
      advanced: false,
      dataList: [],
      // 查询参数
      queryParam: {},
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        if (parameter) {
          const requestParameters = Object.assign({}, parameter, this.queryParam)
          console.log('loadData request parameters:', requestParameters)
          const arrTemp = []
          const pageNum = Math.ceil(responseDataList.length / parameter.pageSize)
          responseDataList.map((item, index) => {
            if (parameter.pageNo < pageNum) {
              if (parameter.pageNo === 1 && index < parameter.pageSize) {
                arrTemp.push(item)
              }
              if (parameter.pageNo > 1 && index >= (parameter.pageNo - 1) * parameter.pageSize && index < parameter.pageNo * parameter.pageSize) {
                arrTemp.push(item)
              }
            } else if (pageNum === 1) {
              arrTemp.push(item)
            } else if (pageNum > 1 && parameter.pageNo === pageNum && index >= (parameter.pageNo - 1) * parameter.pageSize && index < responseDataList.length) {
              arrTemp.push(item)
            }

            // if (parameter.pageNo < Math.ceil(responseDataList.length / parameter.pageSize) &&  parameter.pageNo === 1 && index < parameter.pageSize) {
            //    arrTemp.push(item)
            // }
            // if (1 < parameter.pageNo &&  parameter.pageNo === Math.ceil(responseDataList.length / parameter.pageSize) && (parameter.pageNo - 1) * parameter.pageSize < index) {
            //   arrTemp.push(item)
            // }
            // if (parameter.pageNo > 1 && parameter.pageNo < Math.ceil(responseDataList.length / parameter.pageSize) && (parameter.pageNo - 1) * parameter.pageSize <= index && index < parameter.pageNo * parameter.pageSize) {
            //   arrTemp.push(item)
            // }
          })
          const tempData = {
            pageNo: parameter.pageNo,
            pageSize: parameter.pageSize,
            totalCount: responseDataList.length,
            totalPage: Math.ceil(responseDataList.length / parameter.pageSize),
            data: arrTemp
          }
          return new Promise((resolve, reject) => {
                resolve()
            }).then(res => {
              this.visible = false
              this.confirmLoading = false
              console.log('responseDataList============', tempData)
              return tempData
            })
        }
      },
      changePage: parameter => {
        this.$refs.table.refresh()
      },
      selectedRowKeys: [],
      selectedRows: []
    }
  },
  filters: {
    statusFilter (type) {
      return statusMap[type].text
    },
    statusTypeFilter (type) {
      return statusMap[type].status
    }
  },
  created () {
    getRoleList({ t: new Date() })
  },
  computed: {
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  methods: {
    handleAdd () {
      this.mdl = null
      this.title = '新增险种'
      this.visible = true
    },
    handleEdit (record) {
      this.visible = true
      this.title = '修改险种'
      this.mdl = { ...record }
    },
    queryRisk () {
      queryRiskList(this.queryParam)
      .then(res => {
        res.pageNo = 0
        res.pageSize = 10
        res.totalCount = res.data.length
        res.totalPage = Math.ceil(res.data.length / 10)
        this.dataList = [...res.data]
        responseDataList = res.data
        this.loadData({ pageNo: 0, pageSize: 10 }).then(() => {
          this.$refs.table.refresh()
        })
      })
    },
    handleOk () {
      const form = this.$refs.createModal.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          console.log('values riskSerialNum', values.riskSerialNum)
          if (values.riskSerialNum) {
            // 修改 e.g.
            updateRisk(values)
            .then(res => {
              console.log('res', res)
              this.visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              // this.$refs.table.refresh()
              this.$message.info('修改成功')
              this.queryRisk()
            })
          } else {
            // 新增
            addRisk(values)
            .then(res => {
              this.visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              this.$refs.table.refresh()
              this.$message.info('新增成功')
              this.queryRisk()
            }).error(res => {
              console.log('res', res)
              this.confirmLoading = false
            })
          }
        } else {
          this.confirmLoading = false
        }
      })
    },
    handleCancel () {
      this.visible = false

      const form = this.$refs.createModal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    handleSub (record) {
      if (record.status !== 0) {
        this.$message.info(`${record.no} 订阅成功`)
      } else {
        this.$message.error(`${record.no} 订阅失败，规则已关闭`)
      }
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    resetSearchForm () {
      this.queryParam = {
        date: moment(new Date())
      }
    }
  },
  beforeMount () {
    this.queryRisk()
  }
}
</script>

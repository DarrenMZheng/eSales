<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="代码">
                <a-input v-model="queryParam.productCode" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="名称">
                <a-input v-model="queryParam.productName" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="销售状态">
                <a-select v-model="queryParam.saleStateId" placeholder="请选择" default-value="Y">
                  <a-select-option value="Y">在售</a-select-option>
                  <a-select-option value="N">停售</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="!advanced && 8 || 24" :sm="24">
              <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="queryProduct">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="handleAdd">新建</a-button>
        <a-dropdown v-action:edit v-if="selectedRowKeys.length > 0">
          <a-menu slot="overlay">
            <a-menu-item key="1"><a-icon type="delete" />删除</a-menu-item>
            <!-- lock | unlock -->
            <a-menu-item key="2"><a-icon type="lock" />锁定</a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px">
            批量操作 <a-icon type="down" />
          </a-button>
        </a-dropdown>
      </div>

      <s-table
        ref="table"
        size="default"
        rowKey="key"
        :columns="columns"
        :data="loadData"
        :alert="true"
        :rowSelection="rowSelection"
        :customRow="rowClick"
        showPagination="auto"
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

      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="handleAddInsurance">新建</a-button>
      </div>
      <s-table
        ref="productTable"
        size="default"
        rowKey="key"
        :columns="productColumns"
        :data="loadProductData"
        :alert="true"
        :rowSelection="rowSelection"
        showPagination="auto"
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
            <a @click="handleEditInsurance(record)">修改</a>
          </template>
        </span>
      </s-table>

      <create-form-plan
        ref="createModal"
        :title="title"
        :visible="visible"
        :loading="confirmLoading"
        :model="mdl"
        @cancel="handleCancel"
        @ok="handleOk"
      />
      <create-insurance
        ref="createModalInsurance"
        :visible="insuranceVisible"
        :riskFlag="riskFlag"
        :options="options"
        :riskCode="riskCode"
        :riskName="riskName"
        :loading="confirmLoading"
        :model="mdlInsurance"
        :handleChange="handleChange"
        @cancel="handleInsuranceCancel"
        @ok="handleInsuranceOk"
      />
      <step-by-step-modal ref="modal" @ok="handleOk"/>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import moment from 'moment'
import { STable, Ellipsis } from '@/components'
import { getRoleList, queryProductList, addProduct, updateProduct, queryRiskList, addProductRisk } from '@/api/manage'

import StepByStepModal from './modules/StepByStepModal'
import CreateFormPlan from './modules/CreateFormPlan'
import CreateInsurance from './modules/CreateInsurance'

const columns = [
  // {
  //   title: '产品主键',
  //   dataIndex: 'productSerialNum'
  // },
  {
    title: '代码',
    dataIndex: 'productCode'
  },
  {
    title: '名称',
    dataIndex: 'productName'
  },
  {
    title: '销售状态',
    dataIndex: 'saleStateName',
    scopedSlots: { customRender: 'saleStateName' }
  },
  {
    title: '创建人',
    dataIndex: 'creater',
    scopedSlots: { customRender: 'creater' }
  },
  // {
  //   title: '投保单号剩余量',
  //   dataIndex: 'updatedAt',
  //   sorter: true
  // },
  {
    title: '操作',
    dataIndex: 'action',
    width: '150px',
    scopedSlots: { customRender: 'action' }
  }
]

const productColumns = [
  {
    title: '险种编码',
    dataIndex: 'riskCode'
  },
  {
    title: '险种名称',
    dataIndex: 'riskName'
  },
  {
    title: '主险标志',
    dataIndex: 'mainRiskType',
    scopedSlots: { customRender: 'mainRiskType' }
  },
  {
    title: '交费期间',
    dataIndex: 'paymentPeriod',
    scopedSlots: { customRender: 'paymentPeriod' }
  },
  {
    title: '保额类型',
    dataIndex: 'insurAmountType'
  },
  {
    title: '固定保额',
    dataIndex: 'fixInsurAmount'
  },
  {
    title: '保额比例',
    dataIndex: 'proInsurAmount',
    sorter: true
  },
  {
    title: '固定保费',
    dataIndex: 'fixPremium',
    sorter: true
  }
  // {
  //   title: '操作',
  //   dataIndex: 'action',
  //   width: '150px',
  //   scopedSlots: { customRender: 'action' }
  // }
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
//       'productSerialNum': '110011', // 产品主键  主键
//       'productCode': 'MII', // 产品代码
//       'productName': 'AA', // 产品名称
//       'saleStateName': 'CCDD', // 销售状态名称
//       'creater': '张三', // 创建
//       'riskList': [
//         {
//           'riskSerialNum': '100012', // 险种主键
//           'riskCode': 'LTA', // 险种代码
//           'riskName': '尊享优选', // 险种名称
//           'mainRiskType': 'N', // 主险标志
//           'insurPeriod': '1', // 保险期间
//           'paymentPeriod': '2', // 交费期间
//           'insurAmountType': '1', // 保额类型
//           'fixInsurAmount': '3000000000', // 固定保费
//           'proInsurAmount': '2', // 保额比例
//           'fixPremium': '5000000000' // 固定保额
//         },
//         {
//           'riskSerialNum': '100013', // 险种主键
//           'riskCode': 'MTL', // 险种代码
//           'riskName': '尊享惠选', // 险种名称
//           'mainRiskType': 'N', // 主险标志
//           'insurPeriod': '1', // 保险期间
//           'paymentPeriod': '2', // 交费期间
//           'insurAmountType': '1', // 保额类型
//           'fixInsurAmount': '2000000', // 固定保费
//           'proInsurAmount': '2', // 保额比例
//           'fixPremium': '2000000000' // 固定保额
//         }
//       ]
//     },
//     {// 返回请求数据，JSON 数据格式
//       'productSerialNum': '110012', // 产品主键  主键
//       'productCode': 'MIIqq', // 产品代码
//       'productName': 'AAdsfgh', // 产品名称
//       'saleStateName': 'CCDD', // 销售状态名称
//       'creater': '李四', // 创建
//       'riskList': [
//         {
//           'riskSerialNum': '100016', // 险种主键
//           'riskCode': 'LTAQQ', // 险种代码
//           'riskName': '史蒂夫规划', // 险种名称
//           'mainRiskType': 'N', // 主险标志
//           'insurPeriod': '1', // 保险期间
//           'paymentPeriod': '2', // 交费期间
//           'insurAmountType': '1', // 保额类型
//           'fixInsurAmount': '3000000000', // 固定保费
//           'proInsurAmount': '2', // 保额比例
//           'fixPremium': '5000000000' // 固定保额
//         },
//         {
//           'riskSerialNum': '100017', // 险种主键
//           'riskCode': 'MTL', // 险种代码
//           'riskName': '尊享惠选', // 险种名称
//           'mainRiskType': 'N', // 主险标志
//           'insurPeriod': '1', // 保险期间
//           'paymentPeriod': '2', // 交费期间
//           'insurAmountType': '1', // 保额类型
//           'fixInsurAmount': '2000000', // 固定保费
//           'proInsurAmount': '2', // 保额比例
//           'fixPremium': '2000000000' // 固定保额
//         }
//       ]
//     },
//     {// 返回请求数据，JSON 数据格式
//       'productSerialNum': '110013', // 产品主键  主键
//       'productCode': 'DFCMII', // 产品代码
//       'productName': 'A士大夫A', // 产品名称
//       'saleStateName': 'CCDD', // 销售状态名称
//       'creater': '刘武', // 创建
//       'riskList': [
//         {
//           'riskSerialNum': '100018', // 险种主键
//           'riskCode': 'LTA', // 险种代码
//           'riskName': '尊享优选时代', // 险种名称
//           'mainRiskType': 'N', // 主险标志
//           'insurPeriod': '1', // 保险期间
//           'paymentPeriod': '2', // 交费期间
//           'insurAmountType': '1', // 保额类型
//           'fixInsurAmount': '3000000000', // 固定保费
//           'proInsurAmount': '2', // 保额比例
//           'fixPremium': '5000000000' // 固定保额
//         },
//         {
//           'riskSerialNum': '100019', // 险种主键
//           'riskCode': 'MTL', // 险种代码
//           'riskName': '尊享惠选地方放', // 险种名称
//           'mainRiskType': 'N', // 主险标志
//           'insurPeriod': '1', // 保险期间
//           'paymentPeriod': '2', // 交费期间
//           'insurAmountType': '1', // 保额类型
//           'fixInsurAmount': '2000000', // 固定保费
//           'proInsurAmount': '2', // 保额比例
//           'fixPremium': '2000000000' // 固定保额
//         }
//       ]
//     }
//   ]
// }

export default {
  name: 'ProductPlan',
  components: {
    STable,
    Ellipsis,
    CreateFormPlan,
    StepByStepModal,
    CreateInsurance
  },
  data () {
    this.columns = columns
    this.productColumns = productColumns
    this.responseDataList = []
    return {
      // create model
      visible: false,
      title: '新增产品',
      insuranceVisible: false,
      confirmLoading: false,
      mdl: null,
      mdlInsurance: null,
      // 高级搜索 展开/关闭
      advanced: false,
      options: [],
      riskFlag: 'Y',
      riskCode: 'Y',
      riskName: 'Y',
      // 查询参数
      queryParam: {},
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        const requestParameters = Object.assign({}, parameter, this.queryParam)
        console.log('loadData request parameters:', requestParameters)
        if (parameter) {
          const requestParameters = Object.assign({}, parameter, this.queryParam)
          console.log('loadData request parameters:', requestParameters)
          const arrTemp = []
          this.responseDataList.map((item, index) => {
            if (parameter.pageNo === 1 && index < parameter.pageSize) {
               arrTemp.push(item)
            }
            if (parameter.pageNo === Math.ceil(this.responseDataList.length / parameter.pageSize) && (parameter.pageNo - 1) * parameter.pageSize < index) {
              arrTemp.push(item)
            }
            if (parameter.pageNo > 1 && parameter.pageNo < Math.ceil(this.responseDataList.length / parameter.pageSize) && (parameter.pageNo - 1) * parameter.pageSize <= index && index < parameter.pageNo * parameter.pageSize) {
              arrTemp.push(item)
            }
          })
          const tempData = {
            pageNo: parameter.pageNo,
            pageSize: parameter.pageSize,
            totalCount: this.responseDataList.length,
            totalPage: Math.ceil(this.responseDataList.length / parameter.pageSize),
            data: arrTemp
          }
          console.log('this.dataList------------', this.dataList)
          return new Promise((resolve, reject) => {
                resolve()
            }).then(res => {
              this.visible = false
              this.confirmLoading = false
              return tempData
            })
        }
      },
      // 查询参数
      queryProductParam: {},
      loadProductData: parameter => {
        const requestParameters = Object.assign({}, parameter, this.queryProductParam)
        console.log('loadData request parameters:', requestParameters)
        return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve()
            }, 1000)
          }).then(res => {
        })
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
      this.title = '新增产品'
      this.visible = true
    },
    handleAddInsurance () {
      this.mdlInsurance = null
      this.insuranceVisible = true
    },
    handleEdit (record) {
      this.title = '修改产品'
      this.mdl = { ...record }
      this.visible = true
    },
    handleEditInsurance (record) {
      this.insuranceVisible = true
      this.mdlInsurance = { ...record }
    },
    handleChange (value) {
      this.options.forEach(item => {
        if (item.value === value) {
          this.riskFlag = item.mainRiskType
          this.riskCode = item.code
          this.riskName = item.label
        }
      })
    },
    queryProduct () {
      queryProductList(this.queryParam)
      .then(res => {
        console.log('res======', res)
        res.pageNo = 0
        res.pageSize = 10
        res.totalCount = res.data.length
        res.totalPage = Math.ceil(res.data.length / 10)
        this.dataList = [...res.data]
        this.responseDataList = res.data
        this.loadData({ pageNo: 0, pageSize: 10 }).then(() => {
          this.$refs.table.refresh()
        })
      })
    },
    queryRisk () {
      queryRiskList()
      .then(res => {
        const riskList = res.data
        riskList.forEach((item, index) => {
          const temp = {
            'value': item.riskSerialNum,
            'label': item.riskName,
            'mainRiskType': item.mainRiskType,
            'key': item.riskSerialNum,
            'code': item.riskCode
          }
          this.options.push(temp)
        })
        console.log('this.options', this.options)
      })
    },
    getProductData (record) {
      const temp = {
        'code': 200, // 状态码，200：请求成功，其他：请求出错
        'msg': null, // 错误消息，成功返回 null, 否则返回出错信息
        'data': record ? record.riskList : []
      }

      this.loadProductData = { ...temp }
      this.$refs.productTable.data = parameter => {
        return new Promise((resolve, reject) => {
              resolve()
          }).then(res => {
            this.visible = false
            this.confirmLoading = false
            return temp
          })
      }
      this.$refs.productTable.refresh()
    },
    rowClick (record, index) {
      return {
        on: {
          click: () => {
            console.log('点了我')
          },
          dblclick: () => {
            console.log('点了我')
            this.getProductData(record)
          }
        }
      }
    },
    handleOk () {
      const form = this.$refs.createModal.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          console.log('values', values)
          if (values.serialNum) {
            // 修改 e.g.
            updateProduct(values)
            .then(res => {
              this.visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              this.$refs.table.refresh()

              this.$message.info('修改成功')
            })
          } else {
            // 新增
            values.saleStateId = 'Y'
            values.creater = 'admin'
            addProduct(values)
            .then(res => {
              this.visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              this.$refs.table.refresh()

              this.$message.info('新增成功')
            })
          }
        } else {
          this.confirmLoading = false
        }
      })
    },
    handleInsuranceOk () {
      const insuranceForm = this.$refs.createModalInsurance.form
      this.confirmLoading = true
      insuranceForm.validateFields((errors, values) => {
        if (!errors) {
          console.log('values', values)
          if (values.riskSerialNum > 0) {
            // 修改 e.g.
          addProductRisk(values)
          .then(res => {
              this.insuranceVisible = false
              this.confirmLoading = false
              // 重置表单数据
              insuranceForm.resetFields()
              // 刷新表格
              this.$refs.table.refresh()

              this.$message.info('修改成功')
            })
          } else {
            // 新增
            addProductRisk(values)
            .then(res => {
              this.insuranceVisible = false
              this.confirmLoading = false
              // 重置表单数据
              insuranceForm.resetFields()
              // 刷新表格
              this.$refs.productTable.refresh()

              this.$message.info('新增成功')
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
    handleInsuranceCancel () {
      this.insuranceVisible = false
      const insuranceForm = this.$refs.createModalInsurance.form
      insuranceForm.resetFields() // 清理表单数据（可不做）
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
      if (selectedRows.length > 0) {
        this.getProductData(selectedRows[0])
      } else {
        this.getProductData()
      }
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
    this.queryProduct()
    this.queryRisk()
  }
}
</script>

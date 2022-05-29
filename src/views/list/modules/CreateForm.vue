<template>
  <a-modal
    :title="title"
    :width="640"
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => { $emit('ok') }"
    @cancel="() => { $emit('cancel') }"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" v-bind="formLayout" labelAlign="left">
        <!-- 检查是否有 id 并且大于0，大于0是修改。其他是新增，新增不显示主键ID -->
        <a-form-item label="主键ID" v-show="model && model.riskSerialNum > 0" v-bind="formItemLayout">
          <a-input v-decorator="['riskSerialNum']" />
        </a-form-item>
        <a-form-item label="险种ID" v-bind="formItemLayout">
          <a-input v-decorator="['riskId', {rules: [{required: true, message: '请输入至少五个字符的规则描述！'}]}]" />
        </a-form-item>
        <a-form-item label="代码" v-bind="formItemLayout">
          <a-input v-decorator="['riskCode', {rules: [{required: true, message: '请输入至少五个字符的规则描述！'}]}]" />
        </a-form-item>
        <a-form-item label="名称" v-bind="formItemLayout">
          <a-input v-decorator="['riskName', {rules: [{required: true, message: '请输入至少五个字符的规则描述！'}]}]" />
        </a-form-item>
        <a-form-item label="主险标志" v-bind="formItemLayout">
          <a-radio-group v-decorator="['mainRiskType']" >
            <a-radio value="Y">Y</a-radio>
            <a-radio value="N">N</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="条款地址" v-bind="formItemLayout">
          <a-input v-decorator="['clauseAdd', {rules: [{required: true, min: 5, message: '请输入至少五个字符的规则描述！'}]}]" />
        </a-form-item>
        <a-divider style="height: 2px; background-color: #f0f0f0" />
        <a-row type="flex" justify="center" align="top">
          <a-col :span="12">
            <a-form-item label="寿险风险">
              <a-input-number v-decorator="['lifeInsurRiskMul', {rules: [{required: true, message: '请输入至少五个字符的规则描述！'}]}]" /> 倍
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="意外险风险">
              <a-input-number v-decorator="['accidentRiskMul', {rules: [{required: true, message: '请输入至少五个字符的规则描述！'}]}]" /> 倍
            </a-form-item>
          </a-col>
        </a-row>
        <a-row type="flex" justify="center" align="top">
          <a-col :span="12">
            <a-form-item label="重疾险风险">
              <a-input-number v-decorator="['sickInsurRiskMul', {rules: [{required: true, message: '请输入至少五个字符的规则描述！'}]}]" /> 倍
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="住院津贴">
              <a-input-number v-decorator="['hospitalizaBenefit', {rules: [{required: true, message: '请输入至少五个字符的规则描述！'}]}]" /> 倍
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'

// 表单字段
const fields = ['riskSerialNum', 'riskId', 'riskCode', 'riskName', 'mainRiskType', 'clauseAdd', 'lifeInsurRiskMul', 'accidentRiskMul', 'sickInsurRiskMul', 'hospitalizaBenefit']

export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    loading: {
      type: Boolean,
      default: () => false
    },
    model: {
      type: Object,
      default: () => null
    }
  },
  data () {
    this.formLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    }
    this.formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 }
      }
    }
    return {
      form: this.$form.createForm(this)
    }
  },
  created () {
    console.log('custom modal created')

    // 防止表单未注册
    fields.forEach(v => this.form.getFieldDecorator(v))

    // 当 model 发生改变时，为表单设置值
    this.$watch('model', () => {
      this.model && this.form.setFieldsValue(pick(this.model, fields))
    })
  }
}
</script>

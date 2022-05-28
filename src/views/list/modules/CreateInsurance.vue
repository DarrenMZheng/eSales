<template>
  <a-modal
    title="新增产品"
    :width="640"
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => { $emit('ok') }"
    @cancel="() => { $emit('cancel') }"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" v-bind="formLayout">
        <a-form-item label="险种">
          <a-input v-decorator="['description', {rules: [{required: true, min: 5, message: '请输入至少五个字符的规则描述！'}]}]" />
        </a-form-item>
        <a-row type="flex" justify="center" align="top">
          <a-col :span="12">
            <a-form-item label="主险标志">
              <a-input v-decorator="['description', {rules: [{required: true, min: 5, message: '请输入至少五个字符的规则描述！'}]}]" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="与主险固定组合">
              <a-radio-group v-decorator="['flag', {initialValue: 0 }]" >
                <a-radio :value="0">是</a-radio>
                <a-radio :value="1">否</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row type="flex" justify="center" align="top">
          <a-col :span="12">
            <a-form-item label="保险期间">
              <a-input v-decorator="['description', {rules: [{required: true, min: 5, message: '请输入至少五个字符的规则描述！'}]}]" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="保险期间年限">
              <a-select v-decorator="['description', {rules: [{required: true, min: 5, message: '请输入至少五个字符的规则描述！'}]}]" >
                <a-select-option value="0">全部</a-select-option>
                <a-select-option value="1">关闭</a-select-option>
                <a-select-option value="2">运行中</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="保额计算类型">
          <a-radio-group v-decorator="['flag', {initialValue: 0 }]" >
            <a-radio :value="0">固定保额</a-radio>
            <a-radio :value="1">与主险保额固定比例</a-radio>
            <a-radio :value="2">不固定保额</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="固定保额">
          <a-input v-decorator="['description', {rules: [{required: true, min: 5, message: '请输入至少五个字符的规则描述！'}]}]" addonAfter="元" />
        </a-form-item>
        <a-form-item label="固定保费">
          <a-input v-decorator="['description', {rules: [{required: true, min: 5, message: '请输入至少五个字符的规则描述！'}]}]" addonAfter="元" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea :rows="3" v-decorator="['description', {rules: [{required: true, min: 5, message: '请输入至少五个字符的规则描述！'}]}]" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'

// 表单字段
const fields = ['description', 'id', 'flag']

export default {
  props: {
    visible: {
      type: Boolean,
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
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
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

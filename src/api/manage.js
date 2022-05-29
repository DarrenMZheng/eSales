import request from '@/utils/request'

const api = {
  user: '/user',
  role: '/role',
  service: '/service',
  permission: '/permission',
  permissionNoPager: '/permission/no-pager',
  orgTree: '/org/tree',
  queryRiskList: 'teleSales/queryRisk',
  addRisk: 'teleSales/addRisk',
  updateRisk: 'teleSales/updateRisk',
  queryProductList: 'teleSales/queryProduct',
  addProduct: 'teleSales/addProduct',
  updateProduct: 'teleSales/updateProduct',
  addProductRisk: 'teleSales/addProductRisk'
}

export default api

// 请求险种信息
export function queryRiskList (parameter) {
  return request({
    url: api.queryRiskList,
    method: 'get',
    params: parameter
  })
}

// 新增险种信息
export function addRisk (parameter) {
  return request({
    url: api.addRisk,
    method: 'post',
    params: parameter
  })
}

// 修改险种信息
export function updateRisk (parameter) {
  return request({
    url: api.updateRisk,
    method: 'put',
    params: parameter
  })
}

// 请求产品信息
export function queryProductList (parameter) {
  return request({
    url: api.queryProductList,
    method: 'get',
    params: parameter
  })
}

// 新增产品信息
export function addProduct (parameter) {
  return request({
    url: api.addProduct,
    method: 'post',
    params: parameter
  })
}

// 修改产品信息
export function updateProduct (parameter) {
  return request({
    url: api.updateProduct,
    method: 'put',
    params: parameter
  })
}

// 新增产品信息
export function addProductRisk (parameter) {
  return request({
    url: api.addProductRisk,
    method: 'post',
    params: parameter
  })
}

export function getUserList (parameter) {
  return request({
    url: api.user,
    method: 'get',
    params: parameter
  })
}

export function getRoleList (parameter) {
  return request({
    url: api.role,
    method: 'get',
    params: parameter
  })
}

export function getServiceList (parameter) {
  return request({
    url: api.service,
    method: 'get',
    params: parameter
  })
}

export function getPermissions (parameter) {
  return request({
    url: api.permissionNoPager,
    method: 'get',
    params: parameter
  })
}

export function getOrgTree (parameter) {
  return request({
    url: api.orgTree,
    method: 'get',
    params: parameter
  })
}

// id == 0 add     post
// id != 0 update  put
export function saveService (parameter) {
  return request({
    url: api.service,
    method: parameter.id === 0 ? 'post' : 'put',
    data: parameter
  })
}

export function saveSub (sub) {
  return request({
    url: '/sub',
    method: sub.id === 0 ? 'post' : 'put',
    data: sub
  })
}

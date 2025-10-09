// api请求接口前缀
export const apiPrefix: string = 'http://localhost:5000'

// 业务状态码
export const httpCode = {
  success: 'success',
  fail: 'fail',
  notFound: 'not_found',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  validateError: 'validate_error',
}

// 类型字符串中文映射
export const typeMap = {
  str: '字符串',
  int: '整型',
  float: '浮点型',
  bool: '布尔型',
}

import type { FieldView } from '@formxjs/ui-core'
import { useFormItemProps } from './shared'
import { ElFormItem, ElUpload } from 'element-plus'
import { ResourceManager } from '@formxjs/core'

export function renderUploadField(view: FieldView) {
  const { ui, componentProps, v, disabled, hasErr, fi, shouldRender } = useFormItemProps(view)
  if (!shouldRender) return null
  const fileList = Array.isArray(v) ? v : []
  const valueType = ui.valueType || 'fileList'
  const onChangeUpload = (_: any, fl: any[]) => {
    if (valueType === 'fileList') view.setValue(fl)
    else view.setValue(_)
  }
  const httpRequest = ui.httpRequest
  const httpRequestResource = ui.httpRequestResource
  const httpReq =
    httpRequest ||
    (typeof httpRequestResource === 'string'
      ? (opts: any) => {
          return ResourceManager.fetch(
            httpRequestResource,
            { file: opts?.file, data: opts?.data },
            { ttl: 0 }
          )
            .then((res) => {
              try {
                opts?.onSuccess?.(res, opts?.file)
              } catch {}
              return res
            })
            .catch((err) => {
              try {
                opts?.onError?.(err)
              } catch {}
              throw err
            })
        }
      : undefined)

  return (
    <ElFormItem {...fi}>
      <ElUpload
        fileList={fileList}
        disabled={disabled}
        httpRequest={httpReq}
        {...componentProps}
        onChange={({ file, fileList }: any) => onChangeUpload(file, fileList)}
        onRemove={({ file, fileList }: any) => onChangeUpload(file, fileList)}
      />
    </ElFormItem>
  )
}

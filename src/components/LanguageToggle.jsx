import React, { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Dropdown, Button, Space } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import ReactCountryFlag from 'react-country-flag'

function LanguageToggle() {
  const { i18n } = useTranslation()

  const change = useCallback((lng) => {
    if (!i18n || i18n.language === lng) return
    i18n.changeLanguage(lng)
  }, [i18n])

  const items = useMemo(() => [
    {
      key: 'vi',
      label: (
        <span className="lang-option">
          <ReactCountryFlag countryCode="VN" svg className="lang-flag" aria-label="Vietnam flag" />
          <span className="lang-label">VI</span>
        </span>
      ),
    },
    {
      key: 'en',
      label: (
        <span className="lang-option">
          <ReactCountryFlag countryCode="GB" svg className="lang-flag" aria-label="United Kingdom flag" />
          <span className="lang-label">EN</span>
        </span>
      ),
    },
  ], [])

  const currentIsVi = Boolean(i18n?.language && i18n.language.startsWith('vi'))

  return (
    <Dropdown
      menu={{
        items,
        onClick: ({ key }) => change(key),
      }}
      trigger={['click']}
      placement="bottomRight"
      overlayClassName="lang-dropdown"
    >
      <Button
        type="text"
        aria-haspopup="true"
        aria-label="Language switcher"
        className="lang-toggle-btn"
      >
        <Space size="small" align="center">
          <ReactCountryFlag
            countryCode={currentIsVi ? 'VN' : 'GB'}
            svg
            className="lang-flag"
            title={currentIsVi ? 'Vietnam' : 'United Kingdom'}
            aria-hidden={false}
            aria-label={currentIsVi ? 'Vietnam flag' : 'United Kingdom flag'}
          />
          <span className="lang-code">{currentIsVi ? 'VI' : 'EN'}</span>
          <span className="lang-caret"><DownOutlined /></span>
        </Space>
      </Button>
    </Dropdown>
  )
}

export default memo(LanguageToggle)

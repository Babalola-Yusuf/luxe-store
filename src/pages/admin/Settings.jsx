import { useState } from 'react'

function Toggle({ initial = false }) {
  const [on, setOn] = useState(initial)
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className={`w-9 h-5 rounded-full relative transition-colors ${on ? 'bg-green-600' : 'bg-border'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  )
}

function SettingRow({ label, children }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0 text-[13px]">
      <span>{label}</span>
      {children}
    </div>
  )
}

function SettingsCard({ title, children }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <h3 className="text-[13px] font-medium mb-3">{title}</h3>
      {children}
    </div>
  )
}

function TextInput({ defaultValue }) {
  return (
    <input
      defaultValue={defaultValue}
      className="px-2 py-1 border border-border rounded text-xs w-24 outline-none focus:border-brand"
    />
  )
}

export default function Settings() {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-5">Settings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        <SettingsCard title="Store Settings">
          <SettingRow label="Store name">      <TextInput defaultValue="Luxe Store" /></SettingRow>
          <SettingRow label="Currency">        <TextInput defaultValue="USD ($)" /></SettingRow>
          <SettingRow label="Tax rate">        <TextInput defaultValue="8.5%" /></SettingRow>
          <SettingRow label="Free shipping over"><TextInput defaultValue="$50" /></SettingRow>
        </SettingsCard>

        <SettingsCard title="Notifications">
          <SettingRow label="New order alerts">   <Toggle initial={true}  /></SettingRow>
          <SettingRow label="Low stock alerts">   <Toggle initial={true}  /></SettingRow>
          <SettingRow label="Customer signups">   <Toggle initial={false} /></SettingRow>
          <SettingRow label="Weekly reports">     <Toggle initial={true}  /></SettingRow>
        </SettingsCard>

        <SettingsCard title="Payment Methods">
          <SettingRow label="Stripe">       <Toggle initial={true}  /></SettingRow>
          <SettingRow label="PayPal">       <Toggle initial={true}  /></SettingRow>
          <SettingRow label="Flutterwave"> <Toggle initial={true}  /></SettingRow>
          <SettingRow label="Crypto">       <Toggle initial={false} /></SettingRow>
        </SettingsCard>

        <SettingsCard title="Security">
          <SettingRow label="Two-factor auth">      <Toggle initial={true}  /></SettingRow>
          <SettingRow label="Login notifications">  <Toggle initial={true}  /></SettingRow>
          <SettingRow label="Session timeout">      <TextInput defaultValue="30 min" /></SettingRow>
        </SettingsCard>

      </div>
    </div>
  )
}

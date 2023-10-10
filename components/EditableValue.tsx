import { useDomId } from "@/hooks/useDomId";
import { Input, Text } from "@geist-ui/core";
import { CheckCircle, Edit } from "@geist-ui/react-icons";
import { StyleHTMLAttributes, useEffect, useRef, useState } from "react";
import { css } from "./CSS";

export default function EditableValue({ name, initialValue, save, style }: { name: string, initialValue: string, save?: (value: string) => any | Promise<any>, style?: StyleHTMLAttributes<any> }) {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const className = useDomId('Editable value');
  const ref = useRef<HTMLInputElement>(null);

  const enableEditing = () => setIsEditing(true);
  const disableEditing = async () => {
    setIsLoading(true);
    if (save) await save(value);
    setIsEditing(false);
    setIsLoading(false);
  }

  useEffect(() => {
    if (isEditing) {
      ref.current?.focus();
      ref.current?.select();
    }
  }, [isEditing]);

  return (
    <span style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '8px',
    }}>
      <Text small mb="-8px" style={{
        textTransform: 'uppercase',
        color: '#666',
      }}>{name}</Text>
      <span style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        margin: '0px',
        padding: '0px',
        ...style
      }} className={className}>
        <Input placeholder={initialValue || '(no value)'} disabled={isLoading} ref={ref} value={value} onChange={e => setValue(e.target.value)} crossOrigin onBlur={() => disableEditing()} onKeyUp={e => {
          if (e.key == 'Enter') return disableEditing();
        }} />
        <span className="static-value" onDoubleClick={() => enableEditing()} style={{
          margin: '0px',
          padding: '0px',
          color: value ? undefined : '#3b4858',
        }}>
          {value || '(no value)'}
        </span>

        <span style={{
          cursor: 'pointer',
          marginLeft: '8px'
        }} onClick={() => isEditing ? disableEditing() : enableEditing()}>
          {isEditing ? <CheckCircle size={16} /> : <Edit size={16} />}
        </span>

        {css`
          .${className} .input-wrapper {
            height: unset!important;
            padding: 3px;
            margin: -3px;
          }
          .${className} .input-wrapper input {
            font-size: 16px!important;
            margin: 0px;
            padding: 0px;
          }
          .${className} .input-container {
            height: unset!important;
          }
          .${className} .input-container {
            ${!isEditing ? `display: none;` : ``}
          }
          .${className} .static-value {
            border-bottom: 1px solid transparent;
            border-top: 1px solid transparent;
            ${isEditing ? `display: none;` : ``}
          }
        `}
      </span>
    </span>
  )
}

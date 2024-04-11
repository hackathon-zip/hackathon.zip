import {
  AutoComplete,
  Button,
  Checkbox,
  Input,
  Select,
  Tabs,
  Divider,
  Card,
  Text,
  Textarea
} from "@geist-ui/core";
import { Edit, Eye } from "@geist-ui/icons";
import Markdown from "@/components/Markdown";
import { ButtonTypes } from "@geist-ui/core/esm/button";
import React, { CSSProperties, useState } from "react";

function Required() {
  return (
    <span
      style={{ color: "red", scale: 0.8, left: "2px", position: "relative" }}
    >
      *
    </span>
  );
}

function InputTuple({
  disabled,
  getValue,
  updateValue,
  label,
  mb,
  inputs,
  required
}: {
  disabled?: boolean;
  getValue: any;
  updateValue: any;
  label?: string;
  mb?: number;
  inputs: {
    label: string;
    name: string;
    placeholder?: string;
    type?: string;
  }[];
  required: boolean;
}): any {
  return (
    <>
      <style>{`
        .input-wrapper-1 .input-wrapper.left-label {
          border-radius: 0px;
        }

        .input-wrapper-2 span {
          border-radius: 0px!important;
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "row", gap: 0 }}>
        <div className="input-wrapper-1">
          <Input
            crossOrigin
            aria-disabled={disabled}
            label={inputs[0].label}
            value={getValue(inputs[0].name)}
            onChange={(e) => updateValue(inputs[0].name, e.target.value)}
            name={inputs[0].name}
            width="100%"
            mb={mb ?? 1}
            placeholder={inputs[0].placeholder}
            htmlType={inputs[0].type}
          >
            {label && (
              <Text h5>
                {label}
                {required && <Required />}
              </Text>
            )}
          </Input>
        </div>
        <div
          className="input-wrapper-2"
          style={{
            transform: "translateX(-1px)",
            clipPath:
              "polygon(calc(0% + 1px) 0%, 100% 0%, 100% 100%, calc(0% + 1px) 100%)"
          }}
        >
          <Input
            crossOrigin
            aria-disabled={disabled}
            label={inputs[1].label}
            value={getValue(inputs[1].name)}
            onChange={(e) => updateValue(inputs[1].name, e.target.value)}
            name={inputs[1].name}
            width="100%"
            mb={mb ?? 1}
            placeholder={inputs[1].placeholder}
            htmlType={inputs[1].type}
          >
            {label && <Text h5>​</Text>}
          </Input>
        </div>
      </div>
    </>
  );
}

interface BaseFormElement {
  type: string;
  label?: string;
  miniLabel?: string;
  labelPosition?: string;
  mt?: number;
  mb?: number;
  disabled?: true;
  visible?: (data: { [key: string]: string }) => boolean;
  onKeyup?: (event: any, updateValue: any, getValue: any) => null;
}

interface FormInput extends BaseFormElement {
  validate?: (value: string) => boolean;
  description?: string;
  required?: boolean;
  name: string;
}

interface FormTextInputTuple extends BaseFormElement {
  type: "tuple";
  inputs: [FormTextInput, FormTextInput];
  required?: boolean;
}

interface FormTextInput extends FormInput {
  type:
    | "date"
    | "datetime-local"
    | "text"
    | "email"
    | "password"
    | "number"
    | "textarea"
    | "markdown";
  placeholder?: string;
  inlineLabel?: string;
  defaultValue?: string;
}

interface FormRadio extends FormInput {
  type: "radio";
  options: string[];
}

interface FormCheckbox extends FormInput {
  type: "checkbox";
  options: string[];
  defaultValue: string[];
}

interface FormSelect extends FormInput {
  type: "select";
  placeholder?: string;
  options: string[];
  multipleSelect?: boolean;
  useValuesAsOptions?: boolean;
}

interface FormAutocomplete extends FormInput {
  type: "autocomplete";
  placeholder?: string;
  options: {
    label: string;
    value: string;
  }[];
  defaultValue?: string;
}

export type FormElement =
  | FormTextInput
  | FormRadio
  | FormCheckbox
  | FormSelect
  | FormTextInputTuple
  | FormAutocomplete;

export interface FormSchema {
  elements: Array<FormElement>;
  submitText?: string;
  secondarySubmitText?: string;
}

interface FormValue {
  value: string;
  isValid: boolean;
}

type FormSubmission<T> =
  | {
      type: "request";
      method: "GET" | "POST";
      action: string;
    }
  | {
      type: "controlled";
      onSubmit: (data: T) => void;
    };

export const Form = React.forwardRef(
  (
    {
      schema,
      submission,
      hideSubmit = false,
      style,
      additionalButtons,
      clearValuesOnSuccesfulSubmit = false,
      submitDisabledUntilValid = false,
      submitButtonType = "success",
      gap = 1,
      buttonMt = 0,
      AppendToLabel,
      setData = (data: any) => null
    }: {
      schema: FormSchema;
      submission: FormSubmission<any>;
      hideSubmit?: boolean;
      style?: CSSProperties | undefined;
      additionalButtons?: React.ReactNode;
      clearValuesOnSuccesfulSubmit?: boolean;
      submitDisabledUntilValid?: boolean;
      submitButtonType?: ButtonTypes;
      gap?: number;
      buttonMt?: number;
      AppendToLabel?: any;
      setData?: any;
    },
    ref
  ) => {
    const inputFields = Object.fromEntries(
      schema.elements
        .map((element: FormElement) => {
          if (element.type == "tuple") {
            return element.inputs.map((input: FormTextInput) => input);
          } else if (element.name) {
            return element;
          }
        })
        .filter((a) => a)
        .flat()
        .map((input) => [input?.name, input]) as [string, FormTextInput][]
    );

    const [values, setValues] = useState<any>(() => {
      let data = Object.fromEntries(
        Object.entries(inputFields).map<[string, FormValue]>(
          ([name, input]) => [
            name,
            {
              value: input.defaultValue ?? "",
              isValid:
                input.validate && input.defaultValue
                  ? input.validate(input.defaultValue)
                  : true,
              showWarning: false
            }
          ]
        )
      );
      setData(data);
      return data;
    });

    const [loading, setLoading] = useState(false);

    function updateValue(name: string, value: string | string[]) {
      const element = inputFields[name] as FormTextInput;
      let generateValues = (old: any) => {
        if (!old[name]) {
          old[name] = {
            value: ""
          };
        }
        old[name].value =
          Array.isArray(old[name]?.value) && !Array.isArray(value)!
            ? value.split(",")
            : value;
        if (element.required) {
          if (value) {
            if (element.validate) {
              old[name].isValid = element.validate(value as string);
            } else {
              old[name].isValid = true;
            }
          } else {
            old[name].isValid = false;
          }
        } else {
          if (element.validate && value) {
            old[name].isValid = element.validate(value as string);
          } else {
            old[name].isValid = true;
          }
        }
        if (old[name].isValid) old[name].showWarning = false;
        return { ...old };
      };
      setValues(generateValues);
      setData(generateValues);
    }

    function getValue(name: string) {
      const value = values[name]?.value || "";
      return value;
    }

    function getWarningStatus(name: string) {
      const value = values[name]?.showWarning;
      return value;
    }

    function warnValue(name: string) {
      setValues((old: any) => {
        old[name].showWarning = true;
        return { ...old };
      });
    }

    const invalidFields = Object.keys(values).filter(
      (name) => !values[name].isValid
    );

    return (
      <>
        <form
          style={style}
          ref={ref as any}
          {...(submission.type == "request"
            ? {
                method: submission.method,
                action: submission.action,
                onSubmit: (e) => {
                  setLoading(true);
                }
              }
            : {
                onSubmit: async (e) => {
                  e.preventDefault();
                  setLoading(true);
                  let succesful =
                    ((await submission.onSubmit(
                      Object.fromEntries(
                        Object.entries(values).map(([name, value]) => [
                          name,
                          (value as any).value
                        ])
                      )
                    )) as any) || true;
                  if (clearValuesOnSuccesfulSubmit) {
                    setValues(
                      Object.fromEntries(
                        Object.entries(inputFields).map<[string, FormValue]>(
                          ([name, input]) => [
                            name,
                            {
                              value: input.defaultValue ?? "",
                              isValid: false,
                              showWarning: false
                            }
                          ]
                        )
                      )
                    );
                  }
                  setLoading(false);
                }
              })}
        >
          {schema.elements.map((formElement: FormElement) => {
            if (
              typeof formElement.visible != "undefined" &&
              !formElement.visible(values)
            ) {
              return <></>;
            }
            if (
              "date text email password number"
                .split(" ")
                .includes(formElement.type)
            ) {
              const element = formElement as FormTextInput;
              return (
                <Input
                  aria-disabled={loading}
                  type={getWarningStatus(element.name) ? "error" : "default"}
                  value={getValue(element.name)}
                  onChange={(e) => updateValue(element.name, e.target.value)}
                  crossOrigin
                  label={element.inlineLabel}
                  name={element.name}
                  width="100%"
                  mt={element.mt || 0}
                  mb={typeof element.mb == "undefined" ? 1 : element.mb}
                  placeholder={element.placeholder}
                  htmlType={(element as FormTextInput).type}
                  onKeyPress={(event) =>
                    event.key === "Enter" && event.preventDefault()
                  }
                  onKeyDown={(event) =>
                    event.key === "Enter" && event.preventDefault()
                  }
                  onKeyUp={(event) =>
                    element.onKeyup?.(event, updateValue, getValue)
                  }
                >
                  {element.label && (
                    <Text h5 style={{ display: "flex" }}>
                      <span style={{ flexGrow: 1 }}>
                        {element.label}
                        {element.required && !AppendToLabel && <Required />}
                      </span>
                      {AppendToLabel && (
                        <AppendToLabel
                          setValue={updateValue}
                          attributeName={element.name}
                        />
                      )}
                    </Text>
                  )}
                  {element.miniLabel && (
                    <Text
                      small
                      mb={0.5}
                      style={{ display: "block", fontSize: "13px" }}
                    >
                      {element.miniLabel}
                      {element.required && <Required />}
                    </Text>
                  )}
                </Input>
              );
            } else if (formElement.type == "markdown") {
              const element = formElement as FormTextInput;
              return (
                <>
                  {element.label && (
                    <Text h5>
                      {element.label}
                      {element.required && <Required />}
                    </Text>
                  )}
                  {element.miniLabel && (
                    <Text
                      small
                      mt={element.mt || 0}
                      mb={0.5}
                      style={{ display: "block", fontSize: "13px" }}
                    >
                      {element.miniLabel}
                      {element.required && <Required />}
                    </Text>
                  )}
                  <Tabs initialValue="1" leftSpace={0} hoverWidthRatio={1}>
                    <Tabs.Item
                      label={
                        <>
                          <Edit /> Edit
                        </>
                      }
                      value="1"
                    >
                      <Textarea
                        aria-disabled={loading}
                        type={
                          getWarningStatus(element.name) ? "error" : "default"
                        }
                        value={getValue(element.name)}
                        onChange={(e) =>
                          updateValue(element.name, e.target.value)
                        }
                        name={element.name}
                        width="100%"
                        height="400px"
                        mb={typeof element.mb == "undefined" ? 1 : element.mb}
                        placeholder={element.placeholder}
                        onKeyPress={(event) => {
                          if (element.onKeyup) {
                            event.key === "Enter" && event.preventDefault();
                          }
                        }}
                        onKeyDown={(event) => {
                          if (element.onKeyup) {
                            event.key === "Enter" && event.preventDefault();
                          }
                        }}
                        onKeyUp={(event) =>
                          element.onKeyup?.(event, updateValue, getValue)
                        }
                      ></Textarea>
                    </Tabs.Item>
                    <Tabs.Item
                      label={
                        <>
                          <Eye /> Preview{" "}
                        </>
                      }
                      value="2"
                    >
                      <Card
                        style={{ maxHeight: "400px", overflow: "scroll" }}
                        mb={typeof element.mb == "undefined" ? 1 : element.mb}
                      >
                        <Markdown
                          code={getValue(element.name) || "Nothing to preview."}
                        />
                      </Card>
                    </Tabs.Item>
                  </Tabs>
                </>
              );
            } else if (formElement.type == "textarea") {
              const element = formElement as FormTextInput;
              return (
                <>
                  {element.label && (
                    <Text h5>
                      {element.label}
                      {element.required && <Required />}
                    </Text>
                  )}
                  {element.miniLabel && (
                    <Text
                      small
                      mt={element.mt || 0}
                      mb={0.5}
                      style={{ display: "block", fontSize: "13px" }}
                    >
                      {element.miniLabel}
                      {element.required && <Required />}
                    </Text>
                  )}
                  <Textarea
                    aria-disabled={loading}
                    type={getWarningStatus(element.name) ? "error" : "default"}
                    value={getValue(element.name)}
                    onChange={(e) => updateValue(element.name, e.target.value)}
                    name={element.name}
                    width="100%"
                    height="400px"
                    mb={typeof element.mb == "undefined" ? 1 : element.mb}
                    placeholder={element.placeholder}
                    onKeyPress={(event) => {
                      if (element.onKeyup) {
                        event.key === "Enter" && event.preventDefault();
                      }
                    }}
                    onKeyDown={(event) => {
                      if (element.onKeyup) {
                        event.key === "Enter" && event.preventDefault();
                      }
                    }}
                    onKeyUp={(event) =>
                      element.onKeyup?.(event, updateValue, getValue)
                    }
                  ></Textarea>
                </>
              );
            } else if (formElement.type == "tuple") {
              const element = formElement as FormTextInputTuple;
              return (
                <InputTuple
                  disabled={loading}
                  getValue={getValue}
                  updateValue={updateValue}
                  label={element.label}
                  required={!!element.required}
                  inputs={element.inputs.map((input: FormTextInput) => {
                    return {
                      label: input.inlineLabel || "",
                      name: input.name,
                      placeholder: input.placeholder,
                      type: input.type
                    };
                  })}
                />
              );
            } else if (formElement.type == "checkbox") {
              const element = formElement as FormCheckbox;
              return (
                <>
                  {element.label && (
                    <Text h5 mt={1.5} mb={0.5}>
                      {element.label}
                      {element.required && <Required />}
                    </Text>
                  )}
                  <Checkbox.Group
                    value={element.defaultValue}
                    onChange={(e) => updateValue(element.name, e)}
                  >
                    {element.options.map((option) => (
                      <Checkbox
                        value={option}
                        checked={element.defaultValue.includes(option)}
                      >
                        {option}
                      </Checkbox>
                    ))}
                  </Checkbox.Group>
                </>
              );
            } else if (formElement.type == "select") {
              const element = formElement as FormSelect;

              return (
                <>
                  {element.label && (
                    <Text h5 mt={element.mt || 0}>
                      {element.label}
                      {element.required && <Required />}
                    </Text>
                  )}
                  {element.miniLabel && (
                    <Text
                      small
                      mt={element.mt || 0}
                      mb={0.5}
                      style={{
                        display: "block",
                        fontSize: "13px",
                        color: "#333"
                      }}
                    >
                      {element.miniLabel}
                      {element.required && <Required />}
                    </Text>
                  )}
                  <Select
                    placeholder={element.placeholder}
                    width="100%"
                    disabled={loading || element.disabled}
                    aria-label={element.label}
                    multiple={element.multipleSelect || false}
                    value={getValue(element.name)}
                    initialValue={getValue(element.name)}
                    mt={
                      element.mt && !element.label && !element.miniLabel
                        ? element.mt
                        : 0
                    }
                    mb={typeof element.mb == "undefined" ? 1 : element.mb}
                    onChange={(v) =>
                      updateValue(
                        element.name,
                        Array.isArray(v) ? v.join(",") : v
                      )
                    }
                  >
                    {(element.useValuesAsOptions
                      ? getValue(element.name) || []
                      : element.options
                    ).map((option: string) => (
                      <Select.Option key={option} value={option}>
                        {option}
                      </Select.Option>
                    ))}
                  </Select>
                </>
              );
            } else if (formElement.type == "autocomplete") {
              const element = formElement as FormAutocomplete;

              const [options, setOptions] = React.useState(element.options);
              const searchHandler = (currentValue: string) => {
                if (!currentValue) return setOptions([]);
                const relatedOptions = element.options.filter((item) =>
                  item.value.toLowerCase().includes(currentValue.toLowerCase())
                );
                setOptions(relatedOptions);
              };

              return (
                <>
                  {element.label && (
                    <Text h5>
                      {element.label}
                      {element.required && <Required />}
                    </Text>
                  )}
                  <AutoComplete
                    placeholder={element.placeholder}
                    options={options}
                    crossOrigin
                    mb={1}
                    width="100%"
                    onChange={(v) => updateValue(element.name, v)}
                    onSearch={searchHandler}
                    initialValue={element.defaultValue}
                  />
                </>
              );
            }
          })}
          <div
            style={{
              display: hideSubmit ? "none" : "flex",
              flexDirection: "row",
              gap: "16px",
              alignItems: "center",
              marginTop: buttonMt
            }}
          >
            <Button
              loading={loading}
              type={submitButtonType}
              htmlType="submit"
              disabled={submitDisabledUntilValid && invalidFields.length > 0}
              onClick={(e) => {
                if (invalidFields.length) {
                  for (const invalidField of invalidFields) {
                    warnValue(invalidField);
                  }
                  e.preventDefault();
                }
              }}
              style={{ flexGrow: 1 }}
            >
              {schema.submitText ?? "Submit"}
            </Button>
            {
              schema.secondarySubmitText && <Button
                loading={loading}
                type={"secondary"}
                htmlType="submit"
                disabled={submitDisabledUntilValid && invalidFields.length > 0}
                onClick={(e) => {
                  if (invalidFields.length) {
                    for (const invalidField of invalidFields) {
                      warnValue(invalidField);
                    }
                    e.preventDefault();
                  }
                  updateValue("applied", "true")
                }}
                style={{ flexGrow: 1 }}
              >
                {schema.secondarySubmitText ?? "Submit"}
              </Button>
            }
            {additionalButtons}
            {!additionalButtons &&
              Object.values(values).filter((value: any) => value.showWarning)
                .length > 0 && (
                <Text margin={0}>
                  {invalidFields.length} invalid field
                  {invalidFields.length > 1 && "s"}
                </Text>
              )}
          </div>
          {additionalButtons &&
            Object.values(values).filter((value: any) => value.showWarning)
              .length > 0 && (
              <Text margin={0} mt={1}>
                {invalidFields.length} invalid field
                {invalidFields.length > 1 && "s"}
              </Text>
            )}
        </form>
      </>
    );
  }
);

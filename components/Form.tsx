import Debug from "@/components/Debug";
import { Button, Input, Text } from "@geist-ui/core";
import {
  CSSProperties,
  ReactComponentElement,
  useState,
  forwardRef,
} from "react";
import React from "react";

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
  required,
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
              "polygon(calc(0% + 1px) 0%, 100% 0%, 100% 100%, calc(0% + 1px) 100%)",
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
  type: "date" | "text" | "email" | "password" | "number";
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
}

interface FormSelect extends FormInput {
  type: "select";
  placeholder?: string;
  options: string[];
}

type FormElement =
  | FormTextInput
  | FormRadio
  | FormCheckbox
  | FormSelect
  | FormTextInputTuple;

export interface FormSchema {
  elements: Array<FormElement>;
  submitText?: string;
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
    }: {
      schema: FormSchema;
      submission: FormSubmission<any>;
      hideSubmit?: boolean;
      style?: CSSProperties | undefined;
      additionalButtons?: React.ReactNode;
      clearValuesOnSuccesfulSubmit?: boolean;
    },
    ref,
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
        .map((input) => [input?.name, input]) as [string, FormTextInput][],
    );

    const [values, setValues] = useState<any>(
      Object.fromEntries(
        Object.entries(inputFields).map<[string, FormValue]>(
          ([name, input]) => [
            name,
            {
              value: input.defaultValue ?? "",
              isValid: false,
              showWarning: false,
            },
          ],
        ),
      ),
    );

    const [loading, setLoading] = useState(false);

    function updateValue(name: string, value: string) {
      const element = inputFields[name] as FormTextInput;
      setValues((old: any) => {
        old[name].value = value;
        if (element.required) {
          if (value) {
            if (element.validate) {
              old[name].isValid = element.validate(value);
            } else {
              old[name].isValid = true;
            }
          } else {
            old[name].isValid = false;
          }
        } else {
          if (element.validate && value) {
            old[name].isValid = element.validate(value);
          } else {
            old[name].isValid = true;
          }
        }
        if (old[name].isValid) old[name].showWarning = false;
        return { ...old };
      });
    }

    function getValue(name: string) {
      const value = values[name].value || "";
      return value;
    }

    function getWarningStatus(name: string) {
      const value = values[name].showWarning;
      return value;
    }

    function warnValue(name: string) {
      setValues((old: any) => {
        old[name].showWarning = true;
        return { ...old };
      });
    }

    const invalidFields = Object.keys(values).filter(
      (name) => !values[name].isValid,
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
                },
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
                          (value as any).value,
                        ]),
                      ),
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
                              showWarning: false,
                            },
                          ],
                        ),
                      ),
                    );
                  }
                  setLoading(false);
                },
              })}
        >
          {schema.elements.map((formElement: FormElement) => {
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
                  mb={1}
                  placeholder={element.placeholder}
                  htmlType={(element as FormTextInput).type}
                >
                  {element.label && (
                    <Text h5>
                      {element.label}
                      {element.required && <Required />}
                    </Text>
                  )}
                </Input>
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
                      type: input.type,
                    };
                  })}
                />
              );
            }
          })}
          <div
            style={{
              display: hideSubmit ? "none" : "flex",
              flexDirection: "row",
              gap: "16px",
              alignItems: "center",
            }}
          >
            <Button
              loading={loading}
              type={invalidFields.length ? "default" : "success"}
              htmlType="submit"
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
  },
);

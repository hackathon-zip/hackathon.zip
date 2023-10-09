export default function CSS ({ styles }: { styles: string }) {
    return (
        <style dangerouslySetInnerHTML={{ __html: styles }} />
    );
}

type Selector = { className: string; } | { selector: string; }

export function CSSRule (props: Selector & { styles: string }) {
    const selector = "selector" in props ? props.selector : `.${props.className}`;

    return (
        <CSS styles={`
            ${selector} {
                ${props.styles}
            }
        `} />
    );
}

export const css = (strings: TemplateStringsArray, ...values: any[]) => {
    let str = "";

    strings.forEach((string, i) => {
        str += string + (values[i] ?? "");
    });

    return <CSS styles={str} />;
}
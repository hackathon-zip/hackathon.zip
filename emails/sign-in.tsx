import * as React from "react";

interface EmailTemplateProps {
  name: string;
  url: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
  url,
}) => (
  <div>
    <h1>Welcome, {name}!</h1>
    <a href={url}>Click here to sign in. Wahoo!</a>
  </div>
);

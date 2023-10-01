import { Form } from "@/components/Form";
import type { FormSchema } from "@/components/Form";
import type { GetServerSideProps } from "next";

export default function FormPreview({
  formSchema,
}: {
  formSchema: FormSchema;
}) {
  return (
    <div>
      <Form
        schema={formSchema}
        submission={{
          onSubmit: () => null,
          type: "controlled",
        }}
      />
    </div>
  );
}

export const getServerSideProps = (async (context) => {
  const rawSchema = context.params?.schema;
  let schema: FormSchema = {
    elements: [
      {
        name: "error",
        type: "text",
        label: "Error",
      },
    ],
  };

  console.log({ rawSchema });

  try {
    schema = JSON.parse(rawSchema as string) as FormSchema;
  } catch (err) {
    console.error(err);
  }

  return {
    props: {
      formSchema: schema,
    },
  };
}) satisfies GetServerSideProps<{
  formSchema: FormSchema;
}>;

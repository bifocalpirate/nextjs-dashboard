'use server';
import { stat } from "fs";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";
import { redirect } from "next/navigation";
import postgres from "postgres";
import { z } from "zod";


const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number().default(0),
    status: z.enum(['pending', 'paid']),
    date: z.string()
});
const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function deleteInvoice(id:string){
    console.log('deleting invoice')
    await sql`
    DELETE FROM invoices
    WHERE id = ${id}
  `;
    revalidatePath('/dashboard/invoices');    
}
export async function updateInvoice(id: string, formData: FormData)
{
    console.log('updating invoice')
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function createInvoice(formData: FormData)
{
    console.log(formData);
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount') || 0,
        status: formData.get('status') || 'pending',
    });
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
}
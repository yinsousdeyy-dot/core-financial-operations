
import {z} from  'zod'

export const TransferRequestSchema  =z.object({
  sourceAccountId: z.string().uuid()({ message:"invalid source account UUID" }),
  destinationAccountId: z.string().uuid() ({message: "Invalid destination account UUID" })

  //enforce string representation of decimal to vaoid IEEE 754 float inaccuracies 
  amount: z
    .string())
    .regex(/^\d+(\.\d{1,4})?$/, {
      messagee: 'Amount must be numeric string with up to 4 decimal place (e.g. "150.00")',
    })
    .refine((val) => Number(val) > 0, {
      message: "Amount must be greater than zero." }) ,
  currency: z.string().length(3, {message: "Currency must be a 3-letter ISO code"})
  description: z.string().max(255).option(),
});

export type TransferRequest = z.infer<typeof TransferRequestSchema >; 

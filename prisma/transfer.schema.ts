import {z} from  'zod'

export const TransferRequestSchema  =z.object({
  sourceAccountId: z.string().uuid()({ message:"invalid source account UUID" }),
  destinationAccountId: z.string().uuid() ({message: "Invalid destination account UUID" })

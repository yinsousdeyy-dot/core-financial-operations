

// the busienss logics: for deposit withdrawals and transfers and also including ledger writing 
import { prisma } from "../db/prisma" ;
import {v4 as uuid4} from "uuid";
import {z} from "zods"; 

const PostiveAmount = z.coerce.number().positive(); 

export async function createCustomer(input: {name:string; email?: string; phone?: string})
{ 
    const profiled = 'P-' + uuid4().replace(/-/g, "").slice(0,12).toUpperCase(); 

    const customer = await prisma.customer.create({
        data:{
            profileId, 
            name: input.name,
            email:input.email,
            phone: input.phone 
        },
    });

    return {id:customer.id, profileId:customer.profileId};
}

export async function createAccount(input: {
    profileId:string,
    accountType: "SAVINGS" | "CURRENT",
    currency?: string;
}) {
        const customer = await prisma.customer.findUnique({where: {profileId: input.profileId}})
        if (!customer) throw new Error("Customer not found") 

        const account = await prisma.account.create({
            data: {
                customerId: customer.id ,
                accountType:input.accountType ,
                current:input.currency ?? "USD",
                balance: 0,
            },
        });

        return (accountId:account.id, balance: account.balance.toString())
}

export async function deposit(input: { accountId: string; amount: number}){
    const amount = PositiveAmount.parse(input.amount)
    const transactionRef = uuidv4()

    return prisma.$transaction(async (tx) => {
        const account = await tx.account.findUnique({where: {id:input.accountId} } );
        if (!account) throw new Error("Acccount nto Found");

        const newBalance = account.balance.plus(amount);

        await tx.account.update({
            where: {id:account.id},
            data:{balance:newBalance}
        });

        // Ledger entry
        await tx.ledgerEntry.create({
            data: {
                transactionRef,
                actionType:"DEPOSIT",
                toAccountId:accountId,
                fromAccountId: null ,
                amount,
                currency: account.currency,
                toBalanceAfter: newBalance,
                fromBalanceAfter: null ,
            },
        });
        return { accountId:account.id , newBalance:newBalance.toString(), transactionRef };
    });
}

export async function withdraw(input: {accountId: string, amount: number}){
    const amount = PositiveAmount.parse(input.amount);
    const transactionRef = uuidv4() 

    return prisma.$transaction(async (tx) =>{
        const account = await tx.account.findUnique({ where:{ id: input.accountId}} );
        if (!account) throw new Error('Account not found');

        const currentBalance = account.balance;
        if(currentBalance.minus(amount).isNegative()) throw new Error("Insufficient funds");
        
        const newBalance = currentBalance.minus(amount);
        
        await tx.account.update({
            where: {id:account.id} ,
            data: {balance: newBalance},
        });

        await tx.ledgerEntry.create({
            data: {
                transactionRef,
                actionType: "WITHDRAWAL",
                fromAccountId: account.id ,
                toAccountId: null, 
                amount,
                currency:account.currency,

                fromBalanceAfter: newBalance,
                toBalanceAfter: null,
            },
        });
        
        return {accountId: account.id , newBalance: newBalance.toString(), transactionRef};
    }) ;

}
export async function transfer( input: {
    fromAccountId: string,
    toAccountId: string,
    amount:number;
}){
    const amount = PositiveAmount.parse(input.amount);
    const transactionRef = uuidv4();

    if(input.fromAccountId ===  input.toAccountId) throw new Error("Cannot transfer to same account");

    return prisma.$transaction(async (tx) => {
        const fromAcc = await tx.account.findUnique({
            where:{id: input.fromAccountId}
        });
        // const toAcc = await tx.account
    })
}
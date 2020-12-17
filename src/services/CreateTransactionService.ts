import AppError from '../errors/AppError';
import {getCustomRepository,getRepository} from 'typeorm';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type : 'income' | 'outcome';
  category:string;
}

class CreateTransactionService {
  public async execute({title,value,type,category}:Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const {total} = await transactionsRepository.getBalance();

    if(type === 'outcome' && total < value){
      throw new AppError("Você não possui saldo suficiente")
    }

    

    let transactionCategory = await categoryRepository.findOne({
      where:{
        title : category
      }
    });

    if(!transactionCategory){
      transactionCategory = categoryRepository.create({
        title:category
      });

      await categoryRepository.save(transactionCategory);
    }
    
    let transaction = new Transaction();
    transaction = transactionsRepository.create({
      title,
      value,  
      type,
      category:transactionCategory
    });
    console.log(transaction);
    transaction = await transactionsRepository.save(transaction);
    console.log(transaction);
    return transaction;

  }
}

export default CreateTransactionService;

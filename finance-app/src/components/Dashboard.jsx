import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AddIncomeExpenseDialog from './AddIncomeExpenseDialog';

import { auth } from "../config/firebase";
import { getDocs, query, orderBy } from "firebase/firestore";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { CircularProgress } from '@mui/material';
const cardsContent = [{
    title: "Current Balance",
    buttonText: 'Reset Balance'
},
{
    title: "Total Income",
    buttonText: 'Add Income'
}, {
    title: "Total Expenses",
    buttonText: 'Add Expense'
}]
const Dashboard = () => {
    const [showIncomeDialog, setShowIncomeDialog] = useState(false);
    const buttonClickHandler = (type) => {
        switch (type) {
            case 'Add Income': setShowIncomeDialog(true); break;
        }
    }

    const [state, setState] = useState({ loading: true })
    useEffect(() => {
        setState((prev) => ({ ...prev, loading: true }))
        
        fetchTransactions().then((res)=>{}).catch((res=>{})).finally(()=>
        {
            setState((prev)=>({...prev,loading:false}))
            
        });
    }, [])
    const fetchTransactions = async () => {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("User not authenticated");
        }

        const transactionsRef = collection(db, "users", user.uid, "transactions");
        const q = query(transactionsRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        const transactions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        let totalIncome = 0, totalExpense = 0;
        for (let i = 0; i < transactions.length; i++) {
            if (transactions[i].type === "income") {
                totalIncome += transactions[i].amount;
            } else {
                totalExpense += transactions[i].amount;
            }
        }
        setState((prev) => ({
            ...prev,
            'Total Income': totalIncome,
            'Total Expenses': totalExpense,
            'Current Balance': totalIncome - totalExpense
        }))

        return transactions;
    };
    return (
        <div className='dashboard' style={{ padding: '20px' }}>
            {
                !state?.loading && <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {cardsContent?.map((el) => (<Card sx={{ width: '30%' }}>
                        <CardContent >
                            <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14, alignItems: 'center', fontWeight: 'bold' }}>
                                {el?.title}
                            </Typography>

                            <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>{state?.[el?.title]}</Typography>

                        </CardContent>
                        <CardActions>
                            <Button onClick={() => buttonClickHandler(el?.buttonText)} size="small">{el?.buttonText}</Button>
                        </CardActions>
                    </Card>))}
                </div>
            }
            {<AddIncomeExpenseDialog categories={["Salary", "Freelance", "Gift", "Other"]} type={"income"} onClose={() => setShowIncomeDialog(false)} open={showIncomeDialog} />}
            {state?.loading && <Box sx={{ display: 'flex', position: 'absolute', top: '50%', left: '50%' }}>
                <CircularProgress />
            </Box>}
        </div>
    )
}

export default Dashboard
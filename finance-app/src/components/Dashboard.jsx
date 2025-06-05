import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AddIncomeExpenseDialog from "./AddIncomeExpenseDialog";
import { getDocs, query, orderBy } from "firebase/firestore";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../config/firebase";

import { Alert, CircularProgress, Paper, Snackbar } from "@mui/material";
import AddIncomeLineChart from "./AddIncomeLineChart";
import ExpensePieChart from "./ExpensePieChart";
import TransactionTable from "./TransactionTable";
import { parseISO, isValid } from "date-fns";
const cardsContent = [
  {
    title: "Current Balance",
    buttonText: "Reset Balance",
  },
  {
    title: "Total Income",
    buttonText: "Add Income",
  },
  {
    title: "Total Expenses",
    buttonText: "Add Expense",
  },
];
const incomeCategories = ["Salary", "Freelance", "Gift", "Other"];
const expenseCategories = ["Food", "Education", "Office", "Other"];
const Dashboard = () => {
  const [showIncomeDialog, setShowIncomeDialog] = useState({
    open: false,
    type: "income",
    categories: incomeCategories,
  });
  const [open,setIsopen]=useState(false);
  const [snackbar,setSnackbar]=useState({})
  const buttonClickHandler = (type) => {
    switch (type) {
      case "Add Income":
        setShowIncomeDialog({
          open: true,
          categories: incomeCategories,
          type: "income",
        });
        break;
      case "Add Expense":
        setShowIncomeDialog({
          open: true,
          categories: expenseCategories,
          type: "expense",
        });
        break;
    }
  };

  const [state, setState] = useState({ loading: true });
  useEffect(() => {
    setState((prev) => ({ ...prev, loading: true }));

    fetchTransactions().finally(() => {
      setState((prev) => ({ ...prev, loading: false }));
    });
  }, []);
  const fetchTransactions = async () => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const transactionsRef = collection(db, "users", user.uid, "transactions");
    const q = query(transactionsRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    const transactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    let totalIncome = 0,
      totalExpense = 0;

    for (let i = 0; i < transactions.length; i++) {
      if (transactions[i].type === "income") {
        totalIncome += Number(transactions[i].amount);
      } else {
        totalExpense += Number(transactions[i].amount);
      }
    }
    setState((prev) => ({
      ...prev,
      "Total Income": totalIncome,
      "Total Expenses": totalExpense,
      "Current Balance": totalIncome - totalExpense,
      transactions: transactions,
    }));

    return transactions;
  };
  const onDialogCloseHandler = (type, action) => {
    if (action) {
      setState((prev) => ({ ...prev, loading: true }));
      fetchTransactions().finally(() => {
        setState((prev) => ({ ...prev, loading: false }));
      });
    }
    setShowIncomeDialog({
      open: false,
    });
  };
  const handleDelete = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      const docRef = doc(db, "users", user.uid, "transactions", id);
      await deleteDoc(docRef);
      setState((prev) => ({ ...prev, loading: true }));
      fetchTransactions().finally(() => {
        setState((prev) => ({ ...prev, loading: false }));
      });
    } catch (error) {
    }
  };
  const handleEdit = async (row) => {
    setShowIncomeDialog({
      categories: row?.type === "income" ? incomeCategories : expenseCategories,
      type: row?.type,
      open: true,
      isEdit: true,
      data: row,
    });
  };
  const uploadCSVDataToDB = async (transactions) => {  
    if(!transactions?.length){
      setSnackbar({message:'Export to CSV for sample file',severity:'error'});
      setIsopen(true)
      return;
    }
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const batchAdd = transactions.map((item) => {
        return addDoc(collection(db, "users", auth.currentUser.uid, "transactions"), {
          ...item
        });
      });
  
      await Promise.all(batchAdd);
      fetchTransactions().finally(()=>{
        setState((prev) => ({ ...prev, loading: false }));
      })
    } catch (err) {
    } finally {

      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  
  return (
    <div className="dashboard" style={{ padding: "20px" }}>
      {!state?.loading && (
        <div
          className="overview"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          {cardsContent?.map((el) => (
            <Card className="card" key={el?.title} sx={{ width: "30%" }}>
              <CardContent>
                <Typography
                  gutterBottom
                  sx={{
                    color: "text.secondary",
                    fontSize: 14,
                    alignItems: "center",
                    fontWeight: "bold",
                  }}
                >
                  {el?.title}
                </Typography>

                <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
                  ₹{state?.[el?.title]}
                </Typography>
              </CardContent>
              <CardActions>
                {el?.buttonText !== "Reset Balance" && (
                  <Button
                    onClick={() => buttonClickHandler(el?.buttonText)}
                    size="small"
                    fullWidth
                    style={{ textTransform: "none" }}
                    variant="contained"
                  >
                    {el?.buttonText}
                  </Button>
                )}
              </CardActions>
            </Card>
          ))}
        </div>
      )}
      {
        <AddIncomeExpenseDialog
          categories={showIncomeDialog?.categories}
          type={showIncomeDialog?.type}
          onClose={(type, action) => onDialogCloseHandler(type, action)}
          open={showIncomeDialog?.open}
          isEdit={showIncomeDialog?.isEdit}
          data={showIncomeDialog?.data}
        />
      }

      {state?.loading && (
        <Box
          sx={{
            display: "flex",
            position: "absolute",
            top: "50%",
            left: "50%",
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {!state?.loading && Boolean(state?.transactions?.length) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 4,
            marginTop: 4,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 300, textAlign: "center" }}>
            <Paper sx={{ p: 1 }} elevation={1}>
              <Typography sx={{ fontWeight: "bold" }}>
                Income Analysis
              </Typography>
              <AddIncomeLineChart transactions={state.transactions} />
            </Paper>
          </Box>
          <Box sx={{ flex: 1, minWidth: 300, textAlign: "center" }}>
            <Paper sx={{ p: 1 }} elevation={1}>
              <Typography sx={{ fontWeight: "bold" }}>
                Expense Analysis
              </Typography>
              <ExpensePieChart transactions={state.transactions} />
            </Paper>
          </Box>
        </Box>
      )}
      {!state?.loading && Boolean(state?.transactions?.length) && (
        <TransactionTable
          loading={state?.loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          transactions={state?.transactions}
          uploadCSVDataToDB={uploadCSVDataToDB}
        />
      )}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={()=>{setIsopen(false)}}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={()=>{setIsopen(false)}} severity={snackbar.severity} variant="filled">
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Dashboard;

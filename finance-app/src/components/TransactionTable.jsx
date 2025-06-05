import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  Typography,
  Box,
  TextField,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  useMediaQuery,
  DialogTitle,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import Papa from "papaparse";
import { format } from 'date-fns';


const headCells = [
  { id: "type", label: "Type" },
  { id: "amount", label: "Amount" },
  { id: "category", label: "Category" },
  { id: "note", label: "Name" },
  { id: "timestamp", label: "Date" },
  { id: "action", label: "Action" },
];
const descendingComparator = (a, b, orderBy) => {
  if (orderBy === "timestamp") {
    return b[orderBy]?.toDate() - a[orderBy]?.toDate();
  }
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
};

const getComparator = (order, orderBy) => {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

const stableSort = (array, comparator) => {
  const stabilized = array.map((el, index) => [el, index]);
  stabilized.sort((a, b) => {
    const comp = comparator(a[0], b[0]);
    if (comp !== 0) return comp;
    return a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
};

const TransactionTable = ({ transactions = [], onDelete, onEdit }) => {
    console.log(transactions,"transactions")
  const [page, setPage] = useState(0);
  const fileInputRef = React.useRef(null);

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("timestamp");
  const [type, setType] = React.useState("all");
  const [inputText, setInputText] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selecetdRow, setSelectedRow] = useState({});
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const handleChange = (event) => {
    setType(event.target.value);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value));
    setPage(0);
  };

  const sortedRows = stableSort(
    transactions?.filter(
      (el) =>
        el?.note
          ?.trim()
          ?.toLowerCase()
          ?.includes(inputText?.trim()?.toLowerCase()) &&
        (el?.type === type || type === "all")
    ),
    getComparator(order, orderBy)
  );
  const paginatedRows = sortedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const exportToCSV = (data, filename = "transactions.csv") => {
    console.log(data, "kkk");
    const csv = Papa.unparse(
      data?.map((el) => ({
        Type: el?.type,
        Amount: el?.amount,
        Category: el?.category,
        Name: el?.note,
        Date: new Date(el?.timestamp?.seconds * 1000)
          .toISOString()
          .split("T")[0],
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleCSVImport = (file) => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const parsedData = results.data.map((row) => ({
          type: row.Type?.toLowerCase(),
          amount: Number(row.Amount),
          category: row.Category,
          note: row.Name,
          timestamp: row.Date,
        }));
        console.log("Imported data:", parsedData);
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
      },
    });
  };

  return (
    <Paper sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Transaction History
      </Typography>
      <Box
        component="form"
        sx={{ "& > :not(style)": { m: 1, width: "90%", display: "flex" } }}
        className="transaction-filters"
        style={{ display: "flex" }}
        noValidate
        autoComplete="off"
      >
        <TextField
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          size="small"
          id="outlined-basic"
          label="Search by Name"
          variant="outlined"
        />

        <FormControl size="small">
          <InputLabel size="small" id="demo-simple-select-label">
            Select
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={type}
            size="small"
            label="Age"
            onChange={handleChange}
          >
            <MenuItem value={"all"}>All</MenuItem>
            <MenuItem value={"income"}>Income</MenuItem>
            <MenuItem value={"expense"}>Expense</MenuItem>
          </Select>
        </FormControl>

        <Button variant="outlined" onClick={() => exportToCSV(transactions)}>
          Export to CSV
        </Button>

        <Button variant="contained" onClick={() => fileInputRef.current.click()}>Import from CSV</Button>
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={(e) => handleCSVImport(e.target.files[0])}
        />
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow style={{ backgroundColor: "#ccc" }}>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  {headCell?.label !== "Action" && (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : "asc"}
                      onClick={() => handleRequestSort(headCell.id)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell sx={{ textTransform: "capitalize" }}>
                  {row.type}
                </TableCell>
                <TableCell>₹{row.amount}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>{row.note}</TableCell>
                <TableCell>
                  {row.timestamp
                    }
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      onEdit(row);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setSelectedRow(row);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {paginatedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={
          transactions?.filter(
            (el) =>
              el?.note
                ?.trim()
                ?.toLowerCase()
                ?.includes(inputText?.trim()?.toLowerCase()) &&
              (el?.type === type || type === "all")
          ).length
        }
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
      {showDeleteDialog && (
        <Dialog
          fullScreen={fullScreen}
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          aria-labelledby="delete-dialog-title"
        >
          <DialogTitle id="delete-dialog-title">Delete Transaction</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to permanently delete this transaction? This
              action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteDialog(false)} color="primary">
              Cancel
            </Button>
            <Button
              onClick={() => onDelete(selecetdRow.id)}
              color="error"
              autoFocus
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Paper>
  );
};

export default TransactionTable;

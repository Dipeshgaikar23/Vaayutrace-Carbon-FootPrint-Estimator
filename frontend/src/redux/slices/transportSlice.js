import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  calculateTransportApi,
  calculateAndSaveTransportApi,
  getTransportRecordsApi,
  deleteTransportRecordApi,
  getTransportPredictionApi,
} from "../../api/transportApi";

export const calculateTransport = createAsyncThunk(
  "transport/calculate",
  async (data, { rejectWithValue }) => {
    try {
      const res = await calculateTransportApi(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const calculateAndSaveTransport = createAsyncThunk(
  "transport/calculateAndSave",
  async (data, { rejectWithValue }) => {
    try {
      const res = await calculateAndSaveTransportApi(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTransportRecords = createAsyncThunk(
  "transport/fetchRecords",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getTransportRecordsApi();
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTransportRecord = createAsyncThunk(
  "transport/deleteRecord",
  async (id, { rejectWithValue }) => {
    try {
      await deleteTransportRecordApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTransportPrediction = createAsyncThunk(
  "transport/fetchPrediction",
  async (days, { rejectWithValue }) => {
    try {
      const res = await getTransportPredictionApi(days);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const transportSlice = createSlice({
  name: "transport",
  initialState: {
    currentResult: null,
    records: [],
    recordCount: 0,
    canPredict: false,
    prediction: null,
    loading: false,
    predicting: false,
    error: null,
  },
  reducers: {
    clearCurrentResult: (state) => {
      state.currentResult = null;
    },
    clearPrediction: (state) => {
      state.prediction = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(calculateTransport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentResult = null;
      })
      .addCase(calculateTransport.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResult = action.payload.data;
      })
      .addCase(calculateTransport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(calculateAndSaveTransport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateAndSaveTransport.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResult = action.payload.data;
        if (action.payload.data.record) {
          state.records.push(action.payload.data.record);
          state.recordCount += 1;
          state.canPredict = state.recordCount >= 2;
        }
      })
      .addCase(calculateAndSaveTransport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchTransportRecords.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransportRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.data.records;
        state.recordCount = action.payload.data.count;
        state.canPredict = action.payload.data.canPredict;
      })
      .addCase(fetchTransportRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(deleteTransportRecord.fulfilled, (state, action) => {
        state.records = state.records.filter((r) => r._id !== action.payload);
        state.recordCount = Math.max(0, state.recordCount - 1);
        state.canPredict = state.recordCount >= 2;
      })
      .addCase(deleteTransportRecord.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(fetchTransportPrediction.pending, (state) => {
        state.predicting = true;
        state.error = null;
        state.prediction = null;
      })
      .addCase(fetchTransportPrediction.fulfilled, (state, action) => {
        state.predicting = false;
        state.prediction = action.payload.data;
      })
      .addCase(fetchTransportPrediction.rejected, (state, action) => {
        state.predicting = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentResult, clearPrediction, clearError } =
  transportSlice.actions;
export default transportSlice.reducer;
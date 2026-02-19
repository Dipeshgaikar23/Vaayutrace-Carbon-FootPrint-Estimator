import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  calculateElectricityApi,
  calculateAndSaveElectricityApi,
  getElectricityRecordsApi,
  deleteElectricityRecordApi,
  getElectricityPredictionApi,
} from "../../api/electricityApi";

export const calculateElectricity = createAsyncThunk(
  "electricity/calculate",
  async (data, { rejectWithValue }) => {
    try {
      const res = await calculateElectricityApi(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const calculateAndSaveElectricity = createAsyncThunk(
  "electricity/calculateAndSave",
  async (data, { rejectWithValue }) => {
    try {
      const res = await calculateAndSaveElectricityApi(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchElectricityRecords = createAsyncThunk(
  "electricity/fetchRecords",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getElectricityRecordsApi();
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteElectricityRecord = createAsyncThunk(
  "electricity/deleteRecord",
  async (id, { rejectWithValue }) => {
    try {
      await deleteElectricityRecordApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchElectricityPrediction = createAsyncThunk(
  "electricity/fetchPrediction",
  async (days, { rejectWithValue }) => {
    try {
      const res = await getElectricityPredictionApi(days);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const electricitySlice = createSlice({
  name: "electricity",
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
    // Calculate
    builder
      .addCase(calculateElectricity.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentResult = null;
      })
      .addCase(calculateElectricity.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResult = action.payload.data;
      })
      .addCase(calculateElectricity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Calculate and Save
    builder
      .addCase(calculateAndSaveElectricity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateAndSaveElectricity.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResult = action.payload.data;
        if (action.payload.data.record) {
          state.records.push(action.payload.data.record);
          state.recordCount += 1;
          state.canPredict = state.recordCount >= 2;
        }
      })
      .addCase(calculateAndSaveElectricity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Records
    builder
      .addCase(fetchElectricityRecords.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchElectricityRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.data.records;
        state.recordCount = action.payload.data.count;
        state.canPredict = action.payload.data.canPredict;
      })
      .addCase(fetchElectricityRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Record
    builder
      .addCase(deleteElectricityRecord.fulfilled, (state, action) => {
        state.records = state.records.filter((r) => r._id !== action.payload);
        state.recordCount = Math.max(0, state.recordCount - 1);
        state.canPredict = state.recordCount >= 2;
      })
      .addCase(deleteElectricityRecord.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Prediction
    builder
      .addCase(fetchElectricityPrediction.pending, (state) => {
        state.predicting = true;
        state.error = null;
        state.prediction = null;
      })
      .addCase(fetchElectricityPrediction.fulfilled, (state, action) => {
        state.predicting = false;
        state.prediction = action.payload.data;
      })
      .addCase(fetchElectricityPrediction.rejected, (state, action) => {
        state.predicting = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentResult, clearPrediction, clearError } =
  electricitySlice.actions;
export default electricitySlice.reducer;
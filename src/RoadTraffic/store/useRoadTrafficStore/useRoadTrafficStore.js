import {CSVLoader} from '@loaders.gl/csv';
import {load} from '@loaders.gl/core';
import { create } from 'zustand';
import { DateTime } from 'luxon';


export const useRoadTrafficStore = create((set) => ({
    locations: null,
    fetchLocations: async (url) => {
      const dta = await load(url, CSVLoader)
      set({ locations: dta })
    },
    daily: null,
    hourly: null,
    fetchDaily: async ({url, getDailyCount, getID=(k) => k.POSTE_ID}) => {
      const dta = await load(url, CSVLoader)
      set({ daily: dta.map((k) => ({ date: DateTime.fromISO(k.date), count: getDailyCount(k), id: getID(k) })) }) 
    },
    fetchHourly: async ({url, getHourlyCounts, getID=(k) => k.POSTE_ID}) => {
      const dta = await load(url, CSVLoader)
      set({ hourly: dta.map((k) => ({...getHourlyCounts(k), id: getID(k) })) }) 
    },
    resetData: () => set({ daily: null, hourly: null }),
    currentStation: null,
    setCurrentStation: (currentStation) => set({ currentStation }),
    currentYear: 2021,
    setCurrentYear: (currentYear) => set({ currentYear })
}))
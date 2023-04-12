import { useState, createContext, Suspense, useMemo } from 'react';


export const MapContext = createContext({
    currentStop: null,
    setCurrentStop: () => null,
});


export default function MapState({children}) {
    console.count('mapstate')
    const [currentStop, setCurrentStop] = useState(null);
    const [currentLine, setCurrentLine] = useState(null);
    const [currentYear, setCurrentYear] = useState(2023);

    const mapContextValue = useMemo(() => ({currentStop, setCurrentStop, currentLine, setCurrentLine, currentYear, setCurrentYear}))

    return (
        <Suspense fallback={<p>Loading ...</p>}>
            <MapContext.Provider value={mapContextValue}>
                {children}
            </MapContext.Provider>
        </Suspense>
    )
}
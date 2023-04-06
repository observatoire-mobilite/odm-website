import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

export default function ComplexStat({children, title, subtitle, caption}) {
    return (<Paper sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minWidth: '200px'
    }}>
        <Typography variant="h6" color="primary">
            {title}
        </Typography>
        {subtitle && <Typography variant="subtitle">
            {subtitle}
        </Typography>}
        {children}
        {caption && <Typography variant="caption">
            {caption}
        </Typography>}
    </Paper>)
}
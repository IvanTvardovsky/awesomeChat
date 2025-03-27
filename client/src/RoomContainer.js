import React, { useState } from 'react';
import { Tabs, Tab, Box, Container, Typography } from '@mui/material';
import RoomList from './RoomList';
import RoomCreate from './RoomCreate';

const RoomContainer = ({ onJoinRoom, onCreateRoom }) => {
    const [tabIndex, setTabIndex] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    return (
        <Container component="main" maxWidth="md">
            <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
                Комнаты
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
                <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Room Tabs">
                    <Tab label="Список комнат" />
                    <Tab label="Создать комнату" />
                </Tabs>
            </Box>
            <Box sx={{ mt: 2 }}>
                {tabIndex === 0 && <RoomList onJoinRoom={onJoinRoom} />}
                {tabIndex === 1 && <RoomCreate onCreateRoom={onCreateRoom} />}
            </Box>
        </Container>
    );
};

export default RoomContainer;

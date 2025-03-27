import React, { useState, useEffect } from 'react';
import {
    Button,
    TextField,
    Typography,
    Container,
    Grid,
    RadioGroup,
    FormControlLabel,
    Radio,
    MenuItem,
    Box
} from '@mui/material';

const topics = [
    { id: 1, title: 'Технологии', icon: '💻' },
    { id: 2, title: 'Здоровье и благополучие', icon: '🏥' },
    { id: 3, title: 'Образование и саморазвитие', icon: '📚' },
    { id: 4, title: 'Искусство и культура', icon: '🎨' },
    { id: 5, title: 'Путешествия и приключения', icon: '✈️' },
    { id: 6, title: 'Экология и устойчивое развитие', icon: '🌱' }
];

const subtopics = {
    1: [
        { id: 101, title: 'Как ИИ влияет на рынок труда?' },
        { id: 102, title: 'Этика в разработке новых технологий' },
        { id: 103, title: 'Развитие квантовых вычислений' },
        { id: 104, title: 'Интернет вещей (IoT)' },
        { id: 105, title: 'Кибербезопасность' }
    ],
    2: [
        { id: 201, title: 'Здоровое питание' },
        { id: 202, title: 'Физическая активность' },
        { id: 203, title: 'Психическое здоровье' },
        { id: 204, title: 'Медитация и релаксация' },
        { id: 205, title: 'Профилактика заболеваний' }
    ],
    3: [
        { id: 301, title: 'Онлайн-курсы' },
        { id: 302, title: 'Чтение и литература' },
        { id: 303, title: 'Языковое обучение' },
        { id: 304, title: 'Навыки будущего' },
        { id: 305, title: 'Образовательные технологии' }
    ],
    4: [
        { id: 401, title: 'Современное искусство' },
        { id: 402, title: 'Классическая музыка' },
        { id: 403, title: 'Кино и театр' },
        { id: 404, title: 'Литература и поэзия' },
        { id: 405, title: 'Культурное наследие' }
    ],
    5: [
        { id: 501, title: 'Популярные направления' },
        { id: 502, title: 'Культурные путешествия' },
        { id: 503, title: 'Приключенческий туризм' },
        { id: 504, title: 'Путешествия с семьей' },
        { id: 505, title: 'Фотография путешествий' }
    ],
    6: [
        { id: 601, title: 'Возобновляемая энергия' },
        { id: 602, title: 'Эко-инициативы' },
        { id: 603, title: 'Зеленые технологии' },
        { id: 604, title: 'Сохранение биоразнообразия' },
        { id: 605, title: 'Устойчивое потребление' }
    ]
};

const RoomCreate = ({ onCreateRoom }) => {
    const [roomName, setRoomName] = useState('');
    const [roomType, setRoomType] = useState('open'); // 'open' или 'closed'
    const [createRoomPassword, setCreateRoomPassword] = useState('');
    const [selectedTopic, setSelectedTopic] = useState(1);
    const [selectedSubtopic, setSelectedSubtopic] = useState(
        subtopics[1] ? subtopics[1][0].id : ''
    );

    // обновление выбранного субтопика при смене топика
    useEffect(() => {
        if (subtopics[selectedTopic] && subtopics[selectedTopic].length > 0) {
            setSelectedSubtopic(subtopics[selectedTopic][0].id);
        } else {
            setSelectedSubtopic('');
        }
    }, [selectedTopic]);

    const handleRoomTypeChange = (event) => {
        setRoomType(event.target.value);
        if (event.target.value === 'open') {
            setCreateRoomPassword('');
        }
    };

    const handleCreateRoom = () => {
        if (roomName.trim() !== '') {
            const password = roomType === 'closed' ? createRoomPassword.trim() : '';
            const open = roomType === 'open' ? 1 : 0;
            onCreateRoom(roomName, password, open, 2, selectedTopic, selectedSubtopic);
        } else {
            console.error('Room name is required.');
        }
    };

    return (
        <Container component="main" maxWidth="md">
            <Typography variant="h5" component="h1">
                Создать комнату
            </Typography>
            <Grid container spacing={2} style={{ marginTop: 10 }}>
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        required
                        fullWidth
                        label="Название комнаты"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        select
                        fullWidth
                        label="Топик"
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(parseInt(e.target.value, 10))}
                    >
                        {topics.map((topic) => (
                            <MenuItem key={topic.id} value={topic.id}>
                                {topic.icon} {topic.title}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        select
                        fullWidth
                        label="Субтопик"
                        value={selectedSubtopic}
                        onChange={(e) => setSelectedSubtopic(parseInt(e.target.value, 10))}
                    >
                        {subtopics[selectedTopic] &&
                            subtopics[selectedTopic].map((sub) => (
                                <MenuItem key={sub.id} value={sub.id}>
                                    {sub.title}
                                </MenuItem>
                            ))}
                    </TextField>
                </Grid>
                <Grid item xs={12}>
                    <RadioGroup
                        aria-label="roomType"
                        name="roomType"
                        value={roomType}
                        onChange={handleRoomTypeChange}
                        row
                    >
                        <FormControlLabel value="open" control={<Radio />} label="Открытая" />
                        <FormControlLabel value="closed" control={<Radio />} label="Закрытая" />
                    </RadioGroup>
                </Grid>
                {roomType === 'closed' && (
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Пароль"
                            type="password"
                            value={createRoomPassword}
                            onChange={(e) => setCreateRoomPassword(e.target.value)}
                        />
                    </Grid>
                )}
                <Grid item xs={12}>
                    <Box mt={2}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="secondary"
                            onClick={handleCreateRoom}
                        >
                            Создать комнату
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default RoomCreate;

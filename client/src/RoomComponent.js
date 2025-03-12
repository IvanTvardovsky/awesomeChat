import React, { useState, useEffect, useRef } from 'react';
import {
    Button,
    TextField,
    Typography,
    Container,
    Grid,
    FormControlLabel,
    RadioGroup,
    Radio,
    Box,
    Card,
    CardContent,
    CardActions,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    MenuItem
} from '@mui/material';

// топики (категории)
const topics = [
    { id: 1, title: 'Технологии', icon: '💻', description: 'Обсуждение последних технологических тенденций и инноваций' },
    { id: 2, title: 'Здоровье и благополучие', icon: '🏥', description: 'Обсуждение тем, связанных с физическим и ментальным здоровьем' },
    { id: 3, title: 'Образование и саморазвитие', icon: '📚', description: 'Темы, связанные с обучением и личностным ростом' },
    { id: 4, title: 'Искусство и культура', icon: '🎨', description: 'Обсуждение искусства, музыки, кино и культурных событий' },
    { id: 5, title: 'Путешествия и приключения', icon: '✈️', description: 'Темы, связанные с путешествиями, открытиями и приключениями' },
    { id: 6, title: 'Экология и устойчивое развитие', icon: '🌱', description: 'Обсуждение вопросов экологии, сохранения природы и устойчивого развития' }
];

// субтопики для каждой категории
const subtopics = {
    1: [
        { id: 101, title: 'Как ИИ влияет на рынок труда?', description: 'Обсуждение возможностей и вызовов автоматизации', tags: ['ИИ', 'рынок труда', 'автоматизация'] },
        { id: 102, title: 'Этика в разработке новых технологий', description: 'Как разработчики могут учитывать моральные аспекты?', tags: ['этика', 'технологии', 'разработка'] },
        { id: 103, title: 'Развитие квантовых вычислений', description: 'Обсуждение перспектив квантовых технологий и их применения', tags: ['квантовые вычисления', 'инновации', 'технологии'] },
        { id: 104, title: 'Интернет вещей (IoT)', description: 'Как смарт-устройства меняют повседневную жизнь', tags: ['IoT', 'смарт устройства', 'технологии'] },
        { id: 105, title: 'Кибербезопасность', description: 'Методы защиты от цифровых угроз и кибератак', tags: ['безопасность', 'кибербезопасность', 'технологии'] }
    ],
    2: [
        { id: 201, title: 'Здоровое питание', description: 'Обсуждение правильного питания и современных диет', tags: ['питание', 'здоровье', 'диета'] },
        { id: 202, title: 'Физическая активность', description: 'Польза спорта и активного образа жизни', tags: ['спорт', 'фитнес', 'здоровье'] },
        { id: 203, title: 'Психическое здоровье', description: 'Стратегии по поддержанию ментального благополучия', tags: ['психология', 'здоровье', 'ментальное благополучие'] },
        { id: 204, title: 'Медитация и релаксация', description: 'Техники для снижения стресса и улучшения самочувствия', tags: ['медитация', 'релаксация', 'здоровье'] },
        { id: 205, title: 'Профилактика заболеваний', description: 'Советы по сохранению здоровья и предупреждению болезней', tags: ['профилактика', 'здоровье', 'медицина'] }
    ],
    3: [
        { id: 301, title: 'Онлайн-курсы', description: 'Обсуждение возможностей дистанционного обучения', tags: ['онлайн', 'образование', 'курсы'] },
        { id: 302, title: 'Чтение и литература', description: 'Обмен рекомендациями по книгам и литературе', tags: ['литература', 'чтение', 'образование'] },
        { id: 303, title: 'Языковое обучение', description: 'Методы и ресурсы для изучения иностранных языков', tags: ['языки', 'образование', 'саморазвитие'] },
        { id: 304, title: 'Навыки будущего', description: 'Обсуждение востребованных навыков в современном мире', tags: ['навыки', 'будущее', 'образование'] },
        { id: 305, title: 'Образовательные технологии', description: 'Влияние технологий на методы обучения', tags: ['технологии', 'образование', 'инновации'] }
    ],
    4: [
        { id: 401, title: 'Современное искусство', description: 'Обсуждение новых течений и направлений в искусстве', tags: ['искусство', 'современное', 'культура'] },
        { id: 402, title: 'Классическая музыка', description: 'Дискуссии о произведениях классической музыки', tags: ['музыка', 'классика', 'искусство'] },
        { id: 403, title: 'Кино и театр', description: 'Обсуждение новинок кино и театральных постановок', tags: ['кино', 'театр', 'искусство'] },
        { id: 404, title: 'Литература и поэзия', description: 'Обсуждение книг, поэзии и творческого письма', tags: ['литература', 'поэзия', 'искусство'] },
        { id: 405, title: 'Культурное наследие', description: 'Обсуждение сохранения культурных традиций и наследия', tags: ['наследие', 'традиции', 'культура'] }
    ],
    5: [
        { id: 501, title: 'Популярные направления', description: 'Обсуждение лучших мест для путешествий', tags: ['путешествия', 'направления', 'отдых'] },
        { id: 502, title: 'Культурные путешествия', description: 'Погружение в культуру разных стран', tags: ['культура', 'путешествия', 'отдых'] },
        { id: 503, title: 'Приключенческий туризм', description: 'Обсуждение экстремальных и приключенческих маршрутов', tags: ['приключения', 'туризм', 'отдых'] },
        { id: 504, title: 'Путешествия с семьей', description: 'Советы и опыт для семейных поездок', tags: ['семья', 'путешествия', 'отдых'] },
        { id: 505, title: 'Фотография путешествий', description: 'Обсуждение лучших снимков и техник фотоотчета', tags: ['фотография', 'путешествия', 'искусство'] }
    ],
    6: [
        { id: 601, title: 'Возобновляемая энергия', description: 'Обсуждение альтернативных источников энергии и их перспектив', tags: ['энергия', 'экология', 'устойчивость'] },
        { id: 602, title: 'Эко-инициативы', description: 'Проекты и инициативы по защите окружающей среды', tags: ['экология', 'инициативы', 'природа'] },
        { id: 603, title: 'Зеленые технологии', description: 'Технологии, способствующие экологически чистому развитию', tags: ['зеленые', 'технологии', 'экология'] },
        { id: 604, title: 'Сохранение биоразнообразия', description: 'Методы и стратегии по сохранению природного разнообразия', tags: ['биоразнообразие', 'природа', 'экология'] },
        { id: 605, title: 'Устойчивое потребление', description: 'Обсуждение экологичных подходов к потреблению и образу жизни', tags: ['потребление', 'устойчивость', 'экология'] }
    ]
};

const RoomComponent = ({ onJoinRoom, onCreateRoom }) => {
    const [joinRoomId, setJoinRoomId] = useState('');
    const [roomName, setRoomName] = useState('');
    const [roomType, setRoomType] = useState('open'); // 'open' или 'closed'
    const [createRoomPassword, setCreateRoomPassword] = useState('');
    const [joinRoomPassword, setJoinRoomPassword] = useState('');
    const [availableRooms, setAvailableRooms] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [dialogPassword, setDialogPassword] = useState('');

    // состояния для выбора топика и субтопика при создании комнаты
    const [selectedTopic, setSelectedTopic] = useState(1);
    const [selectedSubtopic, setSelectedSubtopic] = useState(subtopics[1] ? subtopics[1][0].id : '');

    // состояния для фильтрации доступных комнат
    const [filterTopic, setFilterTopic] = useState(0); // 0 - все топики
    const [filterSubtopic, setFilterSubtopic] = useState(0); // 0 - все субтопики

    const socketRef = useRef(null);

    useEffect(() => {
        const socket = new WebSocket('ws://127.0.0.1:8080/roomUpdates');
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('Connected to the WebSocket server');
            // отправляем начальный фильтр
            sendFilterUpdate(filterTopic, filterSubtopic);
        };

        socket.onmessage = (event) => {
            const rooms = JSON.parse(event.data);
            setAvailableRooms(rooms);
        };

        socket.onclose = (event) => {
            console.log('WebSocket connection closed: ', event);
        };

        socket.onerror = (error) => {
            console.log('WebSocket error: ', error);
        };

        return () => {
            socket.close();
        };
    }, []);

    const sendFilterUpdate = (topic, subtopic) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            const filterData = {
                type: 'filter',
                topic,      // id топика или 0 для всех
                subtopic    // id субтопика или 0 для всех
            };
            socketRef.current.send(JSON.stringify(filterData));
        }
    };

    // при смене фильтра по топику сбрасываем субтопик и отправляем новый фильтр
    const handleFilterTopicChange = (e) => {
        const newTopic = parseInt(e.target.value);
        setFilterTopic(newTopic);
        setFilterSubtopic(0);
        sendFilterUpdate(newTopic, 0);
    };

    const handleFilterSubtopicChange = (e) => {
        const newSubtopic = parseInt(e.target.value);
        setFilterSubtopic(newSubtopic);
        sendFilterUpdate(filterTopic, newSubtopic);
    };

    // при смене топика для создания комнаты обновляем список субтопиков
    useEffect(() => {
        if (subtopics[selectedTopic] && subtopics[selectedTopic].length > 0) {
            setSelectedSubtopic(subtopics[selectedTopic][0].id);
        } else {
            setSelectedSubtopic('');
        }
    }, [selectedTopic]);

    const handleJoinRoom = () => {
        if (joinRoomId.trim() !== '') {
            const roomId = joinRoomId.trim();
            const password = joinRoomPassword.trim();
            onJoinRoom(roomId, password);
        } else {
            console.error('Room ID is required');
        }
    };

    const handleCreateRoom = () => {
        if (roomName.trim() !== '') {
            const password = roomType === 'closed' ? createRoomPassword.trim() : '';
            const open = roomType === 'open' ? 1 : 0;
            onCreateRoom(roomName, password, open, 2, selectedTopic, selectedSubtopic);
        } else {
            console.error('Room name is required');
        }
    };

    const getTopicNameById = (topicId) => {
        const topic = topics.find(t => t.id === topicId);
        return topic ? `${topic.icon} ${topic.title}` : 'N/A';
    };

    const getSubtopicNameById = (topicId, subtopicId) => {
        if (!topicId || !subtopicId) return 'N/A';
        const subtopicGroup = subtopics[topicId];
        if (!subtopicGroup) return 'N/A';
        const subtopic = subtopicGroup.find(s => s.id === subtopicId);
        return subtopic ? subtopic.title : 'N/A';
    };

    const handleRoomTypeChange = (event) => {
        setRoomType(event.target.value);
        if (event.target.value === 'open') {
            setCreateRoomPassword('');
        }
    };

    const handleJoinRoomClick = (room) => {
        if (room.open) {
            onJoinRoom(room.id, '');
        } else {
            setSelectedRoomId(room.id);
            setOpenDialog(true);
        }
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setDialogPassword('');
        setSelectedRoomId(null);
    };

    const handleJoinRoomWithPassword = () => {
        if (selectedRoomId !== null) {
            onJoinRoom(selectedRoomId, dialogPassword);
            handleDialogClose();
        }
    };

    return (
        <Container component="main" maxWidth="md">
            <Typography component="h1" variant="h5">
                Join or Create Room
            </Typography>
            <Grid container spacing={2} style={{ marginTop: '10px' }}>
                <Grid item xs={8}>
                    <Typography component="h2" variant="h6">
                        Join a Room
                    </Typography>
                    <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="joinRoomIdInput"
                        label="Room ID"
                        name="joinRoomId"
                        autoComplete="room-id"
                        value={joinRoomId}
                        onChange={(e) => setJoinRoomId(e.target.value)}
                    />
                    <TextField
                        variant="outlined"
                        fullWidth
                        id="joinRoomPasswordInput"
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        value={joinRoomPassword}
                        onChange={(e) => setJoinRoomPassword(e.target.value)}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleJoinRoom}
                    >
                        Join Room
                    </Button>

                    <Typography component="h2" variant="h6" style={{ marginTop: '20px' }}>
                        Create a Room
                    </Typography>
                    <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="roomNameInput"
                        label="Room Name"
                        name="roomName"
                        autoComplete="room-name"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                    />

                    <TextField
                        select
                        fullWidth
                        label="Topic"
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(parseInt(e.target.value))}
                        style={{ marginTop: '10px' }}
                    >
                        {topics.map((topic) => (
                            <MenuItem key={topic.id} value={topic.id}>
                                {topic.icon} {topic.title}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        fullWidth
                        label="Subtopic"
                        value={selectedSubtopic}
                        onChange={(e) => setSelectedSubtopic(parseInt(e.target.value))}
                        style={{ marginTop: '10px' }}
                    >
                        {subtopics[selectedTopic] &&
                            subtopics[selectedTopic].map((sub) => (
                                <MenuItem key={sub.id} value={sub.id}>
                                    {sub.title}
                                </MenuItem>
                            ))}
                    </TextField>

                    <RadioGroup
                        aria-label="roomType"
                        name="roomType"
                        value={roomType}
                        onChange={handleRoomTypeChange}
                        row
                        style={{ marginTop: '10px' }}
                    >
                        <FormControlLabel
                            value="open"
                            control={<Radio />}
                            label="Open Room"
                        />
                        <FormControlLabel
                            value="closed"
                            control={<Radio />}
                            label="Closed Room"
                        />
                    </RadioGroup>
                    {roomType === 'closed' && (
                        <TextField
                            variant="outlined"
                            fullWidth
                            id="createRoomPasswordInput"
                            label="Password"
                            type="password"
                            autoComplete="new-password"
                            value={createRoomPassword}
                            onChange={(e) => setCreateRoomPassword(e.target.value)}
                        />
                    )}
                    <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        onClick={handleCreateRoom}
                        style={{ marginTop: '10px' }}
                    >
                        Create Room
                    </Button>
                </Grid>
                <Grid item xs={4}>
                    <Box mb={2}>
                        <Typography component="h2" variant="h6">
                            Filter Rooms
                        </Typography>
                        <Box display="flex" gap={2} mt={1}>
                            <TextField
                                select
                                label="Topic"
                                value={filterTopic}
                                onChange={handleFilterTopicChange}
                            >
                                <MenuItem value={0}>All Topics</MenuItem>
                                {topics.map((topic) => (
                                    <MenuItem key={topic.id} value={topic.id}>
                                        {topic.title}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label="Subtopic"
                                value={filterSubtopic}
                                onChange={handleFilterSubtopicChange}
                                disabled={filterTopic === 0}
                            >
                                <MenuItem value={0}>All Subtopics</MenuItem>
                                {filterTopic !== 0 &&
                                    subtopics[filterTopic]?.map((sub) => (
                                        <MenuItem key={sub.id} value={sub.id}>
                                            {sub.title}
                                        </MenuItem>
                                    ))}
                            </TextField>
                        </Box>
                    </Box>

                    <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <Typography component="h2" variant="h6">
                            Available Rooms
                        </Typography>
                        {availableRooms.map((room) => (
                            <Card key={room.id} variant="outlined">
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        {room.name}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        Room ID: {room.id}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        {room.open ? 'Open' : 'Closed'}
                                    </Typography>
                                    <Typography variant="body2">
                                        Users: {room.users}/{room.maxUsers}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        Topic: {getTopicNameById(room.topic)}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        Subtopic: {getSubtopicNameById(room.topic, room.subtopic)}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" onClick={() => handleJoinRoomClick(room)}>
                                        Join Room
                                    </Button>
                                </CardActions>
                            </Card>
                        ))}
                    </Box>
                </Grid>
            </Grid>

            {/* диалог ввода пароля для закрытой комнаты */}
            <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>Enter Password</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This room is closed. Please enter the password to join.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Password"
                        type="password"
                        fullWidth
                        value={dialogPassword}
                        onChange={(e) => setDialogPassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleJoinRoomWithPassword} color="primary">
                        Join
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default RoomComponent;

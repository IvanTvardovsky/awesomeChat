package structures

func MakeRoomList(rooms *map[int]*Room) *[]RoomForList {
	roomList := make([]RoomForList, 0, len(*rooms))

	for _, room := range *rooms {
		roomList = append(roomList, RoomForList{
			ID:       room.ID,
			Name:     room.Name,
			Open:     room.Open,
			Users:    len(room.Users),
			MaxUsers: room.MaxUsers,
		})
	}

	return &roomList
}

package structures

type Config struct {
	Listen  Listener      `yaml:"listen"`
	Storage StorageConfig `yaml:"storage"`
	//Key     JWTSecretKey  `yaml:"authorization"`
}

type Listener struct {
	BindIp string `yaml:"bind_ip"`
	Port   string `yaml:"port"`
}

type StorageConfig struct {
	Host     string `yaml:"host"`
	Port     rune   `yaml:"port"`
	Database string `yaml:"database"`
	Username string `yaml:"username"`
	Password string `yaml:"password"`
}

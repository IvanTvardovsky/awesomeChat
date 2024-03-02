package logger

import (
	"github.com/sirupsen/logrus"
	"os"
	"time"
)

func Init() *logrus.Logger {
	log := logrus.New()

	log.SetFormatter(&logrus.TextFormatter{
		ForceColors:      true,
		FullTimestamp:    true,
		TimestampFormat:  time.Stamp,
		DisableTimestamp: false,
		PadLevelText:     true,
	})
	log.SetOutput(os.Stdout)
	log.SetLevel(logrus.TraceLevel)
	return log
}

var Log = Init()

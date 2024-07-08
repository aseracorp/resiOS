package main

import (
	"context"
	"math/rand"
	"os"
	"time"

	"github.com/aseracorp/resiOS/src/authorizationserver"
	"github.com/aseracorp/resiOS/src/constellation"
	"github.com/aseracorp/resiOS/src/cron"
	"github.com/aseracorp/resiOS/src/docker"
	"github.com/aseracorp/resiOS/src/market"
	"github.com/aseracorp/resiOS/src/metrics"
	"github.com/aseracorp/resiOS/src/proxy"
	"github.com/aseracorp/resiOS/src/storage"
	"github.com/aseracorp/resiOS/src/utils"
)

func HandleCLIArgs() bool {
	args := os.Args[1:]

	if len(args) > 0 && args[0] == "rclone" {
			args = args[1:]
			
			storage.RunRClone(args)

			return true
	}

	return false
}

func main() {
	if HandleCLIArgs() {
		return
	}

	docker.IsInsideContainer()

	if os.Getenv("COSMOS_CONFIG_FOLDER") != "" {
		utils.CONFIGFOLDER = os.Getenv("COSMOS_CONFIG_FOLDER")
	} else if utils.IsInsideContainer {
		utils.CONFIGFOLDER = "/config/"
	}

	utils.InitLogs()

	if utils.IsInsideContainer {
		utils.Log("Running inside Docker container")
	} else {
		utils.Log("Running outside Docker container")
	}

	utils.Log("------------------------------------------")
	utils.Log("Starting Cosmos-Server version " + GetCosmosVersion())
	utils.Log("------------------------------------------")

	// utils.ReBootstrapContainer = docker.BootstrapContainerFromTags
	utils.PushShieldMetrics = metrics.PushShieldMetrics
	utils.GetContainerIPByName = docker.GetContainerIPByName
	utils.DoesContainerExist = docker.DoesContainerExist
	utils.CheckDockerNetworkMode = docker.CheckDockerNetworkMode

	rand.Seed(time.Now().UnixNano())

	LoadConfig()

	utils.RemovePIDFile()

	utils.CheckHostNetwork()

	go CRON()

	docker.ExportDocker()

	docker.DockerListenEvents()

	docker.BootstrapAllContainersFromTags()

	docker.RemoveSelfUpdater()

	go func() {
		time.Sleep(180 * time.Second)
		docker.CheckUpdatesAvailable()
	}()

	version, err := docker.DockerClient.ServerVersion(context.Background())
	if err == nil {
		utils.Log("Docker API version: " + version.APIVersion)
	}

	config := utils.GetMainConfig()

	proxy.InitSocketShield()
	proxy.InitUDPShield()

	if !config.NewInstall {
		MigratePre013()
		MigratePre014()

		utils.CheckInternet()

		docker.CheckPuppetDB()

		utils.InitDBBuffers()

		utils.Log("Starting monitoring services...")

		metrics.Init()

		utils.Log("Starting market services...")

		market.Init()

		utils.Log("Starting OpenID services...")

		authorizationserver.Init()

		utils.Log("Starting constellation services...")

		utils.InitFBL()

		constellation.Init()

		utils.ProxyRClone = storage.InitRemoteStorage()

		storage.InitSnapRAIDConfig()

		// Has to be done last, so scheduler does not re-init
		cron.Init()

		utils.Log("Starting server...")
	}

	StartServer()
}

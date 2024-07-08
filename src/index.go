package main

import (
	"math/rand"
	"time"
	"context"

	"github.com/aseracorp/resiOS/src/docker"
	"github.com/aseracorp/resiOS/src/utils"
	"github.com/aseracorp/resiOS/src/authorizationserver"
	"github.com/aseracorp/resiOS/src/market"
	"github.com/aseracorp/resiOS/src/constellation"
	"github.com/aseracorp/resiOS/src/metrics"
	"github.com/aseracorp/resiOS/src/storage"
	"github.com/aseracorp/resiOS/src/cron"
)

func main() {
	utils.Log("------------------------------------------")
	utils.Log("Starting Cosmos-Server version " + GetCosmosVersion())
	utils.Log("------------------------------------------")
	
	// utils.ReBootstrapContainer = docker.BootstrapContainerFromTags
	utils.PushShieldMetrics = metrics.PushShieldMetrics
	utils.GetContainerIPByName = docker.GetContainerIPByName
	utils.DoesContainerExist = docker.DoesContainerExist
	utils.CheckDockerNetworkMode = docker.CheckDockerNetworkMode

	rand.Seed(time.Now().UnixNano())

	docker.IsInsideContainer()
	
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

		storage.InitSnapRAIDConfig()
		
		// Has to be done last, so scheduler does not re-init
		cron.Init()

		utils.Log("Starting server...")
	}

	StartServer()
}

package constellation

import (
	"encoding/json"
	"io/ioutil"
	"os"

	"github.com/azukaar/cosmos-server/src/utils"
)

type SyncPayload struct {
	Database string 
	AuthPrivateKey string 
	AuthPublicKey string
}

func MakeSyncPayload() string {
	utils.Log("Constellation: MakeSyncPayload: Making sync payload")
	// read database file
	dbPath := utils.CONFIGFOLDER + "database"
	dbFile, err := os.Open(dbPath)
	if err != nil {
		utils.Error("Constellation: MakeSyncPayload: Failed to open database file", err)
		return ""
	}

	dbData, err := ioutil.ReadAll(dbFile)
	if err != nil {
		utils.Error("Constellation: MakeSyncPayload: Failed to read database file", err)
		return ""
	}

	// read auth key file
	AuthPrivateKey := utils.GetMainConfig().HTTPConfig.AuthPrivateKey
	AuthPublicKey := utils.GetMainConfig().HTTPConfig.AuthPublicKey

	payload := SyncPayload{
		Database: string(dbData),
		AuthPrivateKey: AuthPrivateKey,
		AuthPublicKey: AuthPublicKey,
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		utils.Error("Constellation: MakeSyncPayload: Failed to marshal payload", err)
		return ""
	}

	return string(payloadBytes)
}

func ReceiveSyncPayload(rawPayload string) {
	utils.Log("Constellation: ReceiveSyncPayload: Received sync payload")
	payload := SyncPayload{}

	err := json.Unmarshal([]byte(rawPayload), &payload)
	if err != nil {
		utils.Error("Constellation: ReceiveSyncPayload: Failed to unmarshal payload", err)
		return
	}

	// write database file
	dbPath := utils.CONFIGFOLDER + "database"
	dbFile, err := os.Create(dbPath)
	if err != nil {
		utils.Error("Constellation: ReceiveSyncPayload: Failed to create database file", err)
		return
	}

	dbFile.Write([]byte(payload.Database))

	// write auth key file
	config := utils.ReadConfigFromFile()
	config.HTTPConfig.AuthPrivateKey = payload.AuthPrivateKey
	config.HTTPConfig.AuthPublicKey = payload.AuthPublicKey
	utils.SetBaseMainConfig(config)
	
	utils.TriggerEvent(
		"cosmos.settings",
		"Settings updated",
		"success",
		"",
		map[string]interface{}{
	})
	
	go (func () {
		utils.RestartHTTPServer()
	})()
}

func RequestSyncPayload() {
	user, _, err := GetNATSCredentials(!utils.GetMainConfig().ConstellationConfig.SlaveMode)
	if err != nil {
		utils.Error("Error getting constellation credentials", err)
		return
	}

	user = sanitizeNATSUsername(user)

	response, err := SendNATSMessage("cosmos."+user+".constellation.data.sync-request", "")

	if err != nil {
		utils.Error("Constellation: RequestSyncPayload: Failed to send request", err)
		return
	}

	ReceiveSyncPayload(string(response))
}

func SendSyncPayload(username string) {
	payload := MakeSyncPayload()

	response, err := SendNATSMessage("cosmos."+username+".constellation.data.sync-receive", payload)

	if err != nil {
		utils.Error("Constellation: SendSyncPayload: Failed to send payload", err)
		return
	}

	if string(response) != "OK" {
		utils.Error("Constellation: SendSyncPayload: Failed to send payload", err)
		return
	}
}
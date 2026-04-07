package db

import "testing"

func TestBuildIndexModelsIncludesUsersEmailUnique(t *testing.T) {
	models := BuildIndexModels()
	users := models["users"]
	if len(users) == 0 {
		t.Fatalf("expected users indexes")
	}

	if users[0].Options == nil || users[0].Options.Unique == nil || !*users[0].Options.Unique {
		t.Fatalf("expected users email index to be unique")
	}
}

func TestBuildIndexModelsIncludesSessionsTTL(t *testing.T) {
	models := BuildIndexModels()
	sessions := models["sessions"]
	if len(sessions) < 2 {
		t.Fatalf("expected sessions indexes")
	}

	if sessions[1].Options == nil || sessions[1].Options.ExpireAfterSeconds == nil || *sessions[1].Options.ExpireAfterSeconds != 0 {
		t.Fatalf("expected sessions ttl index with expireAfterSeconds=0")
	}
}

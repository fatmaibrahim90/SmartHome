#include <ESP8266WiFi.h> //https://github.com/esp8266/Arduino

// needed for library
#include <DNSServer.h>
#include <Adafruit_Sensor.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h> //https://github.com/tzapu/WiFiManager
#include <DHT.h>
#include <PubSubClient.h>
#include <Ultrasonic.h>
#include <Servo.h>

const char *mqttServer = "10.171.224.198";
const int mqttPort = 1883;

// Analog pin connected
#define soilPIN A0

// Digital pin connected
#define LED1 D0
#define LED2 D1
#define buzzer D2
#define DHTPIN D3
#define flamePIN D4
#define PIRpin D5
Ultrasonic ultrasonic(D6, D7);

// variables
int flame = HIGH;

Servo servo;

int GIu_Ultrasonic_Dist_CM = 0;

#define DHTTYPE DHT22 // DHT 22 (AM2302)
DHT dht(DHTPIN, DHTTYPE);

unsigned long previousMillis = 0;
unsigned long interval = 10000;

void callback(char *topic, byte *payload, unsigned int length)
{

  Serial.print("Message arrived in topic: ");
  Serial.println(topic);

  Serial.print("Message:");
  Serial.println();

  String message = "";
  for (int i = 0; i < length; i++)
  {
    Serial.print((char)payload[i]);
    message += (char)payload[i];
  }
  Serial.println("-----------------------");
  //  ************************** OUTPUT LED ***************************************
  if (String(topic) == "LED1")
  {
    if (message == "LED1 ON")
    {
      digitalWrite(LED1, HIGH);
      Serial.println("LED1 IS ON");
    }
    else if (message == "LED1 OFF")
    {
      digitalWrite(LED1, LOW);
    }
  }
  else if (String(topic) == "LED2")
  {
    if (message == "LED2 ON")
    {
      digitalWrite(LED2, HIGH);
      Serial.println("LED2 IS ON");
    }
    else if (message == "LED2 OFF")
    {
      digitalWrite(LED2, LOW);
    }
  }


  
}

WiFiClient espClient;
PubSubClient client(mqttServer, mqttPort, callback, espClient);

void setup()
{

  delay(2000);
  // put your setup code here, to run once:
  Serial.begin(9600);

  // WiFiManager
  // Local intialization. Once its business is done, there is no need to keep it around
  WiFiManager wifiManager;
  // reset saved settings
  // wifiManager.resetSettings();

  // set custom ip for portal
  // wifiManager.setAPStaticIPConfig(IPAddress(10,0,1,1), IPAddress(10,0,1,1), IPAddress(255,255,255,0));

  // fetches ssid and pass from eeprom and tries to connect
  // if it does not connect it starts an access point with the specified name
  // here  "AutoConnectAP"
  // and goes into a blocking loop awaiting configuration
  wifiManager.autoConnect("AutoConnectAP");
  // or use this for auto generated name ESP + ChipID
  // wifiManager.autoConnect();

  // if you get here you have connected to the WiFi
  Serial.println("connected...yeey :)");
  // dht.begin();
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);
  while (!client.connected())
  {
    Serial.println("Connecting to MQTT...");

    if (client.connect("ESP8266Client"))
    {
      Serial.println("connected");
      client.subscribe("LED1");
      client.subscribe("LED2");
      client.subscribe("servo1");
      client.subscribe("buzzer");
    }
    else
    {

      Serial.print("failed with state ");
      Serial.print(client.state());
      delay(2000);
    }
  }

  // to start dht measure
  dht.begin();

  // to set the pins
  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);
  pinMode(buzzer, OUTPUT);
  digitalWrite(buzzer, LOW);
  digitalWrite(LED1, LOW);
  digitalWrite(LED2, LOW);

  pinMode(DHTPIN, INPUT);
  pinMode(flamePIN, INPUT);
  pinMode(PIRpin, INPUT);

    // Configure Servo PIN
  // servo.attach(D8); 
  // servo.write(0);
}

void loop()
{
  client.loop();
  //  ****************************Humidity &&&& Temperature *****************************************
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval)
  {
    // save the last time you updated the DHT values
    previousMillis = currentMillis;
    float t = dht.readTemperature();
    delay(10);
    float h = dht.readHumidity();
    if (!isnan(h) && !isnan(t))
    {
      Serial.println("Temperature : " + String(t));
      Serial.println("Humidity : " + String(h));
      String toSend = String(t) + "," + String(h);
      client.publish("data", toSend.c_str());
    }
  }
  // **************************** Soil Moisture *****************************************
  int s = analogRead(soilPIN);
  Serial.println("Soil Moisture :" + String(s));
  delay(500);
  String toSend = String(s);
  client.publish("soilmois", toSend.c_str());

  // **************************** Flame Sensor *****************************************
  flame = digitalRead(flamePIN);
  if (flame == LOW)
  {
    digitalWrite(LED1, HIGH); // remove
    digitalWrite(buzzer, HIGH);
    String toSendflame = String(flame);
    client.publish("flame", toSendflame.c_str());
    Serial.println("flame Sensor :" + String(flame));
  }
  else
  {
    digitalWrite(LED1, LOW);
    digitalWrite(buzzer, LOW); // remove
  }

  // **************************** Ultrasonic Sensor *****************************************
  delay(2000);
  GIu_Ultrasonic_Dist_CM = ultrasonic.read(CM); // Read ultrasonic distance value in CM or INCH
  String toSendultra = String(GIu_Ultrasonic_Dist_CM);
  client.publish("ultra", toSendultra.c_str());
  Serial.print(GIu_Ultrasonic_Dist_CM);
  Serial.println(" cm");
  // **************************** PIR Sensor *****************************************
  int pirValue = digitalRead(PIRpin);

  if (pirValue == HIGH)
  {
    String toSendpir = String(pirValue);
    client.publish("pir", toSendpir.c_str());
    Serial.println("Motion detected!");
  }


}